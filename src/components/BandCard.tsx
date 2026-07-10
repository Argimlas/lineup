import type { Act, InterestLevel } from '../types';
import { formatTime } from '../lib/time';
import { BG, BORDER } from '../lib/interest';

interface Props {
  act: Act;
  level: InterestLevel;
  seen: boolean;
  onToggle: () => void;
  onToggleSeen: () => void;
}

export default function BandCard({ act, level, seen, onToggle, onToggleSeen }: Props) {
  return (
    <button
      onClick={onToggle}
      title={`${act.name} – Interest: ${level}/3 (click to change)`}
      style={{
        position: 'relative',
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
      <span
        role="button"
        title={seen ? 'Mark as not seen' : 'Mark as seen'}
        onClick={(e) => {
          e.stopPropagation();
          onToggleSeen();
        }}
        style={{
          position: 'absolute',
          top: 2,
          right: 2,
          width: 14,
          height: 14,
          lineHeight: '14px',
          textAlign: 'center',
          fontSize: '10px',
          borderRadius: '50%',
          background: seen ? '#0a3318' : '#2a2a2a',
          border: `1px solid ${seen ? '#163' : '#555'}`,
          color: seen ? '#6f6' : '#777',
          cursor: 'pointer',
        }}
      >
        ✓
      </span>
      <div style={{ fontWeight: 600, fontSize: '11px', lineHeight: 1.2, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', paddingRight: 14 }}>
        {act.name}
      </div>
      <div style={{ color: '#aaa', fontSize: '10px' }}>
        {formatTime(act.startTime)}–{formatTime(act.endTime)}
      </div>
    </button>
  );
}
