export function formatTime(m: number): string {
  return `${String(Math.floor(m / 60) % 24).padStart(2, '0')}:${String(m % 60).padStart(2, '0')}`;
}

export function formatDuration(minutes: number): string {
  if (minutes < 60) return `${minutes} min`;
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return m === 0 ? `${h}h` : `${h}h ${m} min`;
}

export function parseTimeToMinutes(s: string): number | null {
  const [h, m] = s.trim().split(':');
  const hours = parseInt(h, 10);
  const mins = parseInt(m, 10);
  return isNaN(hours) || isNaN(mins) ? null : hours * 60 + mins;
}
