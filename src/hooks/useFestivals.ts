import { useState, useEffect } from 'react';

export interface FestivalMeta {
  id: string;
  name: string;
}

const INDEX_KEY = 'festival_index';
const ACTIVE_KEY = 'active_festival_id';
const DEFAULT_INDEX: FestivalMeta[] = [{ id: 'default', name: 'Festival' }];

function loadIndex(): FestivalMeta[] {
  try {
    const raw = localStorage.getItem(INDEX_KEY);
    if (!raw) return DEFAULT_INDEX;
    const parsed = JSON.parse(raw) as FestivalMeta[];
    return Array.isArray(parsed) && parsed.length > 0 ? parsed : DEFAULT_INDEX;
  } catch {
    return DEFAULT_INDEX;
  }
}

function loadActiveId(index: FestivalMeta[]): string {
  try {
    const raw = localStorage.getItem(ACTIVE_KEY);
    if (raw && index.some(f => f.id === raw)) return raw;
  } catch { /* ignore */ }
  return index[0].id;
}

export function useFestivals(consented: boolean) {
  const [index, setIndex] = useState<FestivalMeta[]>(loadIndex);
  const [activeId, setActiveId] = useState<string>(() => loadActiveId(loadIndex()));

  useEffect(() => {
    if (!consented) return;
    try { localStorage.setItem(INDEX_KEY, JSON.stringify(index)); } catch { /* ignore */ }
  }, [index, consented]);

  useEffect(() => {
    if (!consented) return;
    try { localStorage.setItem(ACTIVE_KEY, activeId); } catch { /* ignore */ }
  }, [activeId, consented]);

  const createFestival = (name: string): string | null => {
    if (index.length >= 4) return null;
    const id = crypto.randomUUID();
    setIndex(prev => [{ id, name }, ...prev]);
    setActiveId(id);
    return id;
  };

  const renameFestival = (id: string, name: string) => {
    setIndex(prev => {
      const meta = prev.find(f => f.id === id);
      if (!meta || meta.name === name) return prev;
      return prev.map(f => (f.id === id ? { ...f, name } : f));
    });
  };

  const deleteFestival = (id: string) => {
    const next = index.filter(f => f.id !== id);
    const safeNext = next.length > 0 ? next : [{ id: crypto.randomUUID(), name: 'Festival' }];
    setIndex(safeNext);
    if (id === activeId) setActiveId(safeNext[0].id);
    try { localStorage.removeItem(`lineup_${id}`); } catch { /* ignore */ }
  };

  return { festivals: index, activeId, setActiveId, createFestival, renameFestival, deleteFestival };
}
