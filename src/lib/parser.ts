import type { Festival, Day, Stage, Act } from '../types';

type State = 'AWAITING_DAY' | 'AWAITING_STAGE' | 'READING_ACTS';

function parseTime(s: string): number {
  const [h, m] = s.trim().split(':');
  const hours = parseInt(h, 10);
  const mins = parseInt(m, 10);
  return isNaN(hours) || isNaN(mins) ? 0 : hours * 60 + mins;
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

// Walks each stage's acts in text order, adding 1440 to a running offset whenever
// a raw startTime drops below the previous act's raw startTime (day rolled over).
function normalizeDay(day: Day): Day {
  return {
    ...day,
    stages: day.stages.map(stage => {
      let offset = 0;
      let prevRawStart: number | null = null;
      const acts = stage.acts.map(act => {
        if (prevRawStart !== null && act.startTime < prevRawStart) offset += 1440;
        prevRawStart = act.startTime;
        return { ...act, startTime: act.startTime + offset, endTime: act.endTime + offset };
      });
      return { ...stage, acts };
    }),
  };
}

function makeId(date: string, stage: string, name: string, startTime: number): string {
  return `${date}|${stage}|${name}|${startTime}`;
}

export function parseLineup(text: string, festivalName = 'Festival'): Festival {
  const lines = text.split('\n');
  const days: Day[] = [];

  let state: State = 'AWAITING_DAY';
  let currentDay: Day | null = null;
  let currentStage: Stage | null = null;

  const pushStage = () => {
    if (currentDay && currentStage) currentDay.stages.push(currentStage);
  };
  const pushDay = () => {
    pushStage();
    currentStage = null;
    if (currentDay) days.push(normalizeDay(currentDay));
  };

  for (const raw of lines) {
    const line = raw.trim();

    if (line === '') {
      if (state === 'READING_ACTS' || state === 'AWAITING_STAGE') {
        pushDay();
        currentDay = null;
        state = 'AWAITING_DAY';
      }
      continue;
    }

    const isAct = line.includes(',');

    if (state === 'AWAITING_DAY') {
      currentDay = { date: normalizeDate(line), stages: [] };
      state = 'AWAITING_STAGE';
      continue;
    }

    if (state === 'AWAITING_STAGE') {
      if (!isAct) {
        currentStage = { name: line, acts: [] };
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
        const act: Act = {
          id: makeId(currentDay!.date, currentStage!.name, name, startTime),
          name,
          stage: currentStage!.name,
          startTime,
          endTime,
        };
        currentStage!.acts.push(act);
      } else {
        pushStage();
        currentStage = { name: line, acts: [] };
      }
    }
  }

  pushDay();

  return { id: 'default', name: festivalName, days };
}
