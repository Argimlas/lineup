import type { FestivalMeta } from '../hooks/useFestivals';

interface Props {
  festivals: FestivalMeta[];
  activeId: string;
  onSelect: (id: string) => void;
}

export default function FestivalTabs({ festivals, activeId, onSelect }: Props) {
  return (
    <div className="festival-tabs-row">
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
  );
}
