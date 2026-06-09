import type { Festival, Day, Stage, Act } from '../types';

type State = 'AWAITING_DAY' | 'AWAITING_STAGE' | 'READING_ACTS';

function parseTime(s: string): number {
  const [h, m] = s.trim().split(':');
  const hours = parseInt(h, 10);
  const mins = parseInt(m, 10);
  return isNaN(hours) || isNaN(mins) ? 0 : hours * 60 + mins;
}

// Acts starting before 6 AM on a day that has late-evening acts are next-day → shift by 1440.
function normalizeDay(day: Day): Day {
  const allActs = day.stages.flatMap(s => s.acts);
  const hasLateEvening = allActs.some(a => a.startTime >= 18 * 60);
  if (!hasLateEvening) return day;
  return {
    ...day,
    stages: day.stages.map(stage => ({
      ...stage,
      acts: stage.acts.map(act =>
        act.startTime < 6 * 60
          ? { ...act, startTime: act.startTime + 1440, endTime: act.endTime + 1440 }
          : act
      ),
    })),
  };
}

function makeId(day: string, stage: string, name: string, startTime: number): string {
  return `${day}|${stage}|${name}|${startTime}`;
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
      currentDay = { name: line, stages: [] };
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
          id: makeId(currentDay!.name, currentStage!.name, name, startTime),
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
