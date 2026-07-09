import { useState, useEffect } from 'react';
import type { Festival, InterestLevel, InterestMap } from '../types';

interface LineupData {
  festival: Festival | null;
  interestMap: InterestMap;
  seenMap: Record<string, boolean>;
}

const defaultData: LineupData = { festival: null, interestMap: {}, seenMap: {} };

function load(festivalId: string): LineupData {
  try {
    const raw = localStorage.getItem(`lineup_${festivalId}`);
    return raw ? { ...defaultData, ...(JSON.parse(raw) as LineupData) } : defaultData;
  } catch {
    return defaultData;
  }
}

export function useLineup(festivalId = 'default', consented = false) {
  const [data, setData] = useState<LineupData>(() => load(festivalId));

  useEffect(() => {
    if (!consented) return;
    localStorage.setItem(`lineup_${festivalId}`, JSON.stringify(data));
  }, [festivalId, data, consented]);

  const setFestival = (festival: Festival | null) =>
    setData(d => ({ ...d, festival }));

  const setInterest = (actId: string, level: InterestLevel) =>
    setData(d => ({ ...d, interestMap: { ...d.interestMap, [actId]: level } }));

  const setSeen = (actId: string) =>
    setData(d => ({ ...d, seenMap: { ...d.seenMap, [actId]: !d.seenMap[actId] } }));

  const clearStorage = () => {
    try { localStorage.removeItem(`lineup_${festivalId}`); } catch { /* ignore */ }
    setData(defaultData);
  };

  return { festival: data.festival, interestMap: data.interestMap, seenMap: data.seenMap, setFestival, setInterest, setSeen, clearStorage };
}
