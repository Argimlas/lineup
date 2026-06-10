import { useState, useEffect } from 'react';
import type { Festival, InterestLevel, InterestMap } from '../types';

interface LineupData {
  festival: Festival | null;
  interestMap: InterestMap;
}

const defaultData: LineupData = { festival: null, interestMap: {} };

function load(festivalId: string): LineupData {
  try {
    const raw = localStorage.getItem(`lineup_${festivalId}`);
    return raw ? (JSON.parse(raw) as LineupData) : defaultData;
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

  const clearStorage = () => {
    try { localStorage.removeItem(`lineup_${festivalId}`); } catch { /* ignore */ }
    setData(defaultData);
  };

  return { festival: data.festival, interestMap: data.interestMap, setFestival, setInterest, clearStorage };
}
