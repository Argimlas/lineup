import { useState } from 'react';

// Once consent turns on (fresh accept, or re-accept after it expired), runs
// `hydrate` once to recover whatever was already saved instead of staying
// on the placeholder default used while pending.
export function useHydrateOnConsent(consented: boolean, hydrate: () => void) {
  const [hydrated, setHydrated] = useState(consented);

  if (consented && !hydrated) {
    setHydrated(true);
    hydrate();
  }
}
