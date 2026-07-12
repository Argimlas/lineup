import type { Festival } from '../types';
import { parseTimeToMinutes } from './time';
import { addAct } from './festival';

type State = 'AWAITING_DAY' | 'AWAITING_STAGE' | 'READING_ACTS';

function parseTime(s: string): number {
  return parseTimeToMinutes(s) ?? 0;
}

const ISO_DATE = /^\d{4}-\d{2}-\d{2}$/;
const DMY_DATE = /^(\d{2})\.(\d{2})\.(\d{4})$/;

// Accepts DD.MM.YYYY or YYYY-MM-DD, normalizes to ISO. Unrecognized input passes through unchanged.
function normalizeDate(line: string): string {
  if (ISO_DATE.test(line)) return line;
  const dmy = line.match(DMY_DATE);
  if (dmy) return `${dmy[3]}-${dmy[2]}-${dmy[1]}`;
  return line;
}

export function parseLineup(text: string, festivalName = 'Festival', festivalId = 'default'): Festival {
  const lines = text.split('\n');

  let state: State = 'AWAITING_DAY';
  let currentDate = '';
  let currentStageName = '';
  let festival: Festival = { id: festivalId, name: festivalName, days: [] };

  for (const raw of lines) {
    const line = raw.trim();

    if (line === '') {
      if (state === 'READING_ACTS' || state === 'AWAITING_STAGE') state = 'AWAITING_DAY';
      continue;
    }

    const isAct = line.includes(',');

    if (state === 'AWAITING_DAY') {
      currentDate = normalizeDate(line);
      state = 'AWAITING_STAGE';
      continue;
    }

    if (state === 'AWAITING_STAGE') {
      if (!isAct) {
        currentStageName = line;
        state = 'READING_ACTS';
      }
      continue;
    }

    if (state === 'READING_ACTS') {
      if (isAct) {
        const parts = line.split(',').map(p => p.trim());
        const name = parts[0];
        const startTime = parseTime(parts[1] ?? '');
        const rawEnd = parseTime(parts[2] ?? '');
        const endTime = rawEnd <= startTime ? rawEnd + 1440 : rawEnd;
        festival = addAct(festival, currentDate, currentStageName, { name, startTime, endTime });
      } else {
        currentStageName = line;
      }
    }
  }

  return festival;
}
