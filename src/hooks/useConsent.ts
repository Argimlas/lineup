import { useState } from 'react';

type ConsentState = 'accepted' | 'declined' | null;

export function useConsent() {
  const [consent, setConsent] = useState<ConsentState>(() => {
    try {
      return localStorage.getItem('consent') as ConsentState;
    } catch {
      return null;
    }
  });

  const accept = () => {
    try { localStorage.setItem('consent', 'accepted'); } catch { /* ignore */ }
    setConsent('accepted');
  };

  const decline = () => {
    try { localStorage.setItem('consent', 'declined'); } catch { /* ignore */ }
    setConsent('declined');
  };

  return { consent, accept, decline };
}
