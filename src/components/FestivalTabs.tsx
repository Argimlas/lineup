import type { FestivalMeta } from '../hooks/useFestivals';

interface Props {
  festivals: FestivalMeta[];
  activeId: string;
  onSelect: (id: string) => void;
}

export default function FestivalTabs({ festivals, activeId, onSelect }: Props) {
  return (
    <>
      <div className="festival-tabs-row festival-tabs-desktop">
        {festivals.map(f => (
          <button
            key={f.id}
            className={`festival-tab${f.id === activeId ? ' active' : ''}`}
            onClick={() => onSelect(f.id)}
          >
            {f.name}
          </button>
        ))}
      </div>
      <select
        className="festival-select"
        value={activeId}
        onChange={e => onSelect(e.target.value)}
        title="Switch festival"
      >
        {festivals.map(f => (
          <option key={f.id} value={f.id}>
            {f.name}
          </option>
        ))}
      </select>
    </>
  );
}
