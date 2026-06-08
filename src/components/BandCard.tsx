import type { Act, InterestLevel } from '../types';

interface Props {
  act: Act;
  level: InterestLevel;
  onToggle: () => void;
}

function toLabel(m: number): string {
  return `${String(Math.floor(m / 60) % 24).padStart(2, '0')}:${String(m % 60).padStart(2, '0')}`;
}

const BG: Record<InterestLevel, string> = {
  0: '#2a2a2a',
  1: '#1e2a35',
  2: '#3a2e00',
  3: '#0a3318',
};

const BORDER: Record<InterestLevel, string> = {
  0: '#444',
  1: '#336',
  2: '#664',
  3: '#163',
};

export default function BandCard({ act, level, onToggle }: Props) {
  return (
    <button
      onClick={onToggle}
      title={`${act.name} – Interesse: ${level}/3 (klicken zum Ändern)`}
      style={{
        display: 'block',
        width: '100%',
        height: '100%',
        textAlign: 'left',
        background: BG[level],
        border: `1px solid ${BORDER[level]}`,
        borderRadius: '3px',
        padding: '2px 4px',
        color: 'inherit',
        cursor: 'pointer',
        overflow: 'hidden',
        boxSizing: 'border-box',
      }}
    >
      <div style={{ fontWeight: 600, fontSize: '11px', lineHeight: 1.2, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
        {act.name}
      </div>
      <div style={{ color: '#aaa', fontSize: '10px' }}>
        {toLabel(act.startTime)}–{toLabel(act.endTime)}
      </div>
    </button>
  );
}
