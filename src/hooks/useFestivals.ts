import { useState, useEffect } from 'react';
import type { Festival } from '../types';
import { todayISODate } from '../lib/date';

export interface FestivalMeta {
  id: string;
  name: string;
}

const INDEX_KEY = 'festival_index';
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

function loadFestivalDays(id: string): Festival['days'] {
  try {
    const raw = localStorage.getItem(`lineup_${id}`);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as { festival?: Festival | null };
    return parsed.festival?.days ?? [];
  } catch {
    return [];
  }
}

// Picks whichever festival is currently running (today falls within its
// first/last day), or failing that the soonest upcoming one — falls back to
// the first festival if none have dates at all (e.g. still empty).
function pickActiveFestival(index: FestivalMeta[]): string {
  const today = todayISODate();
  let upcoming: { id: string; start: string } | null = null;

  for (const meta of index) {
    const days = loadFestivalDays(meta.id);
    if (days.length === 0) continue;
    const dates = days.map(d => d.date).sort();
    const start = dates[0];
    const end = dates[dates.length - 1];
    if (start <= today && today <= end) return meta.id;
    if (start > today && (!upcoming || start < upcoming.start)) upcoming = { id: meta.id, start };
  }

  return upcoming?.id ?? index[0].id;
}

export function useFestivals(consented: boolean) {
  // Reads from storage are gated on `consented`: while consent is null or
  // declined, the previously saved festival list must not be loaded (§ 25
  // Abs. 1 TDDDG covers access to already-stored info, not just writing it).
  const [index, setIndex] = useState<FestivalMeta[]>(() => (consented ? loadIndex() : DEFAULT_INDEX));
  const [activeId, setActiveId] = useState<string>(() => (consented ? pickActiveFestival(loadIndex()) : DEFAULT_INDEX[0].id));
  // Once consent turns on (fresh accept, or re-accept after it expired),
  // hydrate from storage so the user recovers whatever was already saved
  // instead of staying on the placeholder default used while pending.
  const [hydrated, setHydrated] = useState(consented);

  if (consented && !hydrated) {
    setHydrated(true);
    const loadedIndex = loadIndex();
    setIndex(loadedIndex);
    setActiveId(pickActiveFestival(loadedIndex));
  }

  useEffect(() => {
    if (!consented) return;
    try { localStorage.setItem(INDEX_KEY, JSON.stringify(index)); } catch { /* ignore */ }
  }, [index, consented]);

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
