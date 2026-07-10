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
      className="band-card"
      onClick={onToggle}
      title={`${act.name} – Interest: ${level}/3 (click to change)`}
      style={{
        background: BG[level],
        border: `1px solid ${BORDER[level]}`,
      }}
    >
      <span
        role="button"
        className={`band-card-seen${seen ? ' seen' : ''}`}
        title={seen ? 'Mark as not seen' : 'Mark as seen'}
        onClick={(e) => {
          e.stopPropagation();
          onToggleSeen();
        }}
      >
        ✓
      </span>
      <div className="band-card-name">
        {act.name}
      </div>
      <div className="band-card-time">
        {formatTime(act.startTime)}–{formatTime(act.endTime)}
      </div>
    </button>
  );
}
