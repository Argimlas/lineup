import type { Festival } from '../types';
import { formatTime } from './time';

export function serializeLineup(festival: Festival): string {
  return festival.days
    .map((day) =>
      [
        day.name,
        ...day.stages.flatMap((stage) => [
          stage.name,
          ...stage.acts.map((act) => `${act.name}, ${formatTime(act.startTime)}, ${formatTime(act.endTime)}`),
        ]),
      ].join('\n'),
    )
    .join('\n\n');
}
