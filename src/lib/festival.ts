import type { Festival, Act } from '../types';

function makeId(date: string, stage: string, name: string, startTime: number): string {
  return `${date}|${stage}|${name}|${startTime}`;
}

export function deleteAct(festival: Festival, actId: string): Festival {
  return {
    ...festival,
    days: festival.days.map(day => ({
      ...day,
      stages: day.stages
        .map(stage => ({ ...stage, acts: stage.acts.filter(a => a.id !== actId) }))
        .filter(stage => stage.acts.length > 0),
    })).filter(day => day.stages.length > 0),
  };
}

export function addAct(festival: Festival | null, dayDate: string, stageName: string, act: Omit<Act, 'id' | 'stage'>, festivalId = 'default'): Festival {
  const base: Festival = festival ?? { id: festivalId, name: 'Festival', days: [] };
  const resolvedAct: Act = { ...act, stage: stageName, id: makeId(dayDate, stageName, act.name, act.startTime) };
  const days = base.days;

  const mergeStage = (stages: Festival['days'][0]['stages']) => {
    const existing = stages.find(s => s.name === stageName);
    if (existing) {
      return stages.map(s => s.name === stageName ? { ...s, acts: [...s.acts, resolvedAct] } : s);
    }
    return [...stages, { name: stageName, acts: [resolvedAct] }];
  };

  const existingDay = days.find(d => d.date === dayDate);
  const newDays = existingDay
    ? days.map(d => d.date === dayDate ? { ...d, stages: mergeStage(d.stages) } : d)
    : [...days, { date: dayDate, stages: [{ name: stageName, acts: [resolvedAct] }] }];

  return { ...base, days: [...newDays].sort((a, b) => (a.date < b.date ? -1 : a.date > b.date ? 1 : 0)) };
}

export function updateAct(festival: Festival, actId: string, changes: { name: string; stage: string; startTime: number; endTime: number }): Festival {
  const day = festival.days.find(d => d.stages.some(s => s.acts.some(a => a.id === actId)));
  if (!day) return festival;
  return addAct(deleteAct(festival, actId), day.date, changes.stage, {
    name: changes.name,
    startTime: changes.startTime,
    endTime: changes.endTime,
  });
}

export function renameStage(festival: Festival, oldName: string, newName: string): Festival {
  return {
    ...festival,
    days: festival.days.map(day => ({
      ...day,
      stages: day.stages.map(stage =>
        stage.name === oldName
          ? { ...stage, name: newName, acts: stage.acts.map(act => ({ ...act, stage: newName })) }
          : stage
      ),
    })),
  };
}
