export interface PresetMeta {
  id: string;
  name: string;
  file: string;
  unofficial?: boolean;
}

export async function fetchPresetManifest(): Promise<PresetMeta[]> {
  try {
    const res = await fetch('/lineups/manifest.json');
    if (!res.ok) return [];
    const data = (await res.json()) as unknown;
    return Array.isArray(data) ? (data as PresetMeta[]) : [];
  } catch {
    return [];
  }
}

export async function fetchPresetLineup(file: string): Promise<string> {
  const res = await fetch(`/lineups/${encodeURIComponent(file)}`);
  if (!res.ok) throw new Error(`Failed to load ${file}`);
  return res.text();
}
