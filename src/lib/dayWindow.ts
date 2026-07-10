import type { Day } from '../types';
import { parseISODate } from './date';

export interface DayWindow {
  start: Date;
  end: Date;
}

const NOMINAL_START_MIN = 6 * 60;
const NOMINAL_END_MIN = 30 * 60; // next calendar day, 06:00

function actDataRange(day: Day): { min: number; max: number } {
  let min = Infinity;
  let max = -Infinity;
  for (const stage of day.stages) {
    for (const act of stage.acts) {
      if (act.startTime < min) min = act.startTime;
      if (act.endTime > max) max = act.endTime;
    }
  }
  return { min, max };
}

function addMinutes(date: Date, minutes: number): Date {
  return new Date(date.getTime() + minutes * 60000);
}

// `days` must already be sorted by date ascending. Each day's window is the
// nominal [date@06:00, date+1@06:00) range, extended (never shrunk) by that
// day's actual act data. A day's start only widens past nominal for day 0
// (no predecessor) — for later days it's chained to the previous day's
// effective end, since an early act there is already covered by the
// previous day's extension.
export function computeDayWindows(days: Day[]): DayWindow[] {
  const windows: DayWindow[] = [];
  let prevEnd: Date | null = null;

  for (const day of days) {
    const midnight = parseISODate(day.date);
    const nominalStart = addMinutes(midnight, NOMINAL_START_MIN);
    const nominalEnd = addMinutes(midnight, NOMINAL_END_MIN);
    const { min, max } = actDataRange(day);

    const end = max > NOMINAL_END_MIN ? addMinutes(midnight, max) : nominalEnd;
    const start = prevEnd
      ? new Date(Math.max(nominalStart.getTime(), prevEnd.getTime()))
      : min < NOMINAL_START_MIN
        ? addMinutes(midnight, min)
        : nominalStart;

    windows.push({ start, end });
    prevEnd = end;
  }

  return windows;
}

export function findActiveDay(days: Day[], now: Date): { dayIndex: number; offsetMinutes: number } | null {
  const windows = computeDayWindows(days);
  const dayIndex = windows.findIndex(w => now >= w.start && now < w.end);
  if (dayIndex === -1) return null;

  const midnight = parseISODate(days[dayIndex].date);
  const offsetMinutes = Math.round((now.getTime() - midnight.getTime()) / 60000);
  return { dayIndex, offsetMinutes };
}
