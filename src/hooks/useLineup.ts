import { useState, useEffect } from 'react';
import type { Festival, InterestLevel, InterestMap } from '../types';
import { safeGet, safeSet } from '../lib/storage';

interface LineupData {
  festival: Festival | null;
  interestMap: InterestMap;
  seenMap: Record<string, boolean>;
}

const defaultData: LineupData = { festival: null, interestMap: {}, seenMap: {} };

function loadFromStorage(festivalId: string): LineupData {
  return { ...defaultData, ...safeGet<Partial<LineupData>>(`lineup_${festivalId}`, {}) };
}

export function useLineup(festivalId = 'default', consented = false) {
  // Cache per-festival data in memory for the life of the tab, independent
  // of consent. Without this, switching festivals while consent is declined
  // (so nothing is written to localStorage) would silently discard whatever
  // was loaded into the festival being switched away from.
  //
  // Reads from storage are gated on `consented`: while consent is null or
  // declined, previously saved data must not be loaded (§ 25 Abs. 1 TDDDG
  // covers access to already-stored info, not just writing new info).
  const [cache, setCache] = useState<Record<string, LineupData>>(() => ({
    [festivalId]: consented ? loadFromStorage(festivalId) : defaultData,
  }));
  // Once consent turns on (fresh accept, or re-accept after it expired),
  // hydrate the active slot from storage so the user recovers whatever was
  // already saved instead of staying on the empty state used while pending.
  const [hydrated, setHydrated] = useState(consented);

  if (!(festivalId in cache)) {
    setCache(c => ({ ...c, [festivalId]: consented ? loadFromStorage(festivalId) : defaultData }));
  }

  if (consented && !hydrated) {
    setHydrated(true);
    setCache(c => ({ ...c, [festivalId]: loadFromStorage(festivalId) }));
  }

  const data = cache[festivalId] ?? defaultData;

  const update = (updater: (d: LineupData) => LineupData) =>
    setCache(c => ({ ...c, [festivalId]: updater(c[festivalId] ?? defaultData) }));

  useEffect(() => {
    if (!consented) return;
    safeSet(`lineup_${festivalId}`, data);
  }, [festivalId, data, consented]);

  const setFestival = (festival: Festival | null) =>
    update(d => ({ ...d, festival }));

  // Used for a wholesale replace (Import, preset Override) rather than an
  // incremental edit (rename, add/edit/delete act): old interest/seen marks
  // shouldn't carry over onto what is effectively a new lineup.
  const replaceFestival = (festival: Festival | null) =>
    update(d => ({ ...d, festival, interestMap: {}, seenMap: {} }));

  // Writes into an arbitrary festival's slot regardless of which one is
  // currently active. Needed right after creating a new festival: `activeId`
  // hasn't re-rendered into this hook's `festivalId` prop yet, so `update`
  // (which always targets `festivalId`) would write to the wrong slot.
  const setFestivalFor = (id: string, festival: Festival | null) => {
    setCache(c => {
      const next = { ...(c[id] ?? (consented ? loadFromStorage(id) : defaultData)), festival };
      if (consented) safeSet(`lineup_${id}`, next);
      return { ...c, [id]: next };
    });
  };

  const setInterest = (actId: string, level: InterestLevel) =>
    update(d => ({ ...d, interestMap: { ...d.interestMap, [actId]: level } }));

  const setSeen = (actId: string) =>
    update(d => ({ ...d, seenMap: { ...d.seenMap, [actId]: !d.seenMap[actId] } }));

  return { festival: data.festival, interestMap: data.interestMap, seenMap: data.seenMap, setFestival, setFestivalFor, replaceFestival, setInterest, setSeen };
}
