export function parseISODate(date: string): Date {
  const [y, m, d] = date.split('-').map(Number);
  return new Date(y, (m || 1) - 1, d || 1);
}

export function formatDayLabel(date: string): string {
  return parseISODate(date).toLocaleDateString(undefined, { weekday: 'short', day: '2-digit', month: '2-digit' });
}
