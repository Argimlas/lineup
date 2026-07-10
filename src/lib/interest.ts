import type { InterestLevel } from '../types';

export const BG: Record<InterestLevel, string> = {
  0: '#2a2a2a',
  1: '#1e2a35',
  2: '#3a2e00',
  3: '#0a3318',
};

export const BORDER: Record<InterestLevel, string> = {
  0: '#444',
  1: '#336',
  2: '#664',
  3: '#163',
};

export const INTEREST_LABELS: Record<InterestLevel, string> = {
  0: 'Not interested',
  1: 'Maybe',
  2: 'Interested',
  3: 'Must see',
};
