import { useState } from 'react';

type ConsentValue = 'accepted' | 'declined';
type ConsentState = ConsentValue | null;

const CONSENT_KEY = 'consent';
const CONSENT_MAX_AGE_MS = 365 * 24 * 60 * 60 * 1000; // 12 months

interface StoredConsent {
  value: ConsentValue;
  timestamp: number;
}

function readConsent(): ConsentState {
  try {
    const raw = localStorage.getItem(CONSENT_KEY);
    if (!raw) return null;
    // Legacy format: a bare 'accepted' | 'declined' string with no timestamp.
    // Migrate it instead of forcing a re-prompt.
    if (raw === 'accepted' || raw === 'declined') {
      writeConsent(raw);
      return raw;
    }
    const { value, timestamp } = JSON.parse(raw) as StoredConsent;
    if (Date.now() - timestamp > CONSENT_MAX_AGE_MS) {
      localStorage.removeItem(CONSENT_KEY);
      return null;
    }
    return value;
  } catch {
    return null;
  }
}

function writeConsent(value: ConsentValue) {
  const record: StoredConsent = { value, timestamp: Date.now() };
  try { localStorage.setItem(CONSENT_KEY, JSON.stringify(record)); } catch { /* ignore */ }
}

export function useConsent() {
  const [consent, setConsent] = useState<ConsentState>(readConsent);

  const accept = () => {
    writeConsent('accepted');
    setConsent('accepted');
  };

  const decline = () => {
    writeConsent('declined');
    setConsent('declined');
  };

  const reset = () => {
    try { localStorage.removeItem(CONSENT_KEY); } catch { /* ignore */ }
    setConsent(null);
  };

  return { consent, accept, decline, reset };
}
