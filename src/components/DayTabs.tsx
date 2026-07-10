import type { Day, InterestLevel } from '../types';
import { BG, BORDER, INTEREST_LABELS } from '../lib/interest';
import { formatDayLabel } from '../lib/date';

interface Props {
  days: Day[];
  activeIndex: number;
  onSelect: (index: number) => void;
  selectedLevels: Set<InterestLevel>;
  onToggleLevel: (level: InterestLevel) => void;
}

const FILTER_LEVELS: InterestLevel[] = [1, 2, 3];
const ACTIVE_TEXT: Record<InterestLevel, string> = { 0: '#888', 1: '#5fa8ff', 2: '#e8c547', 3: '#6f6' };

export default function DayTabs({ days, activeIndex, onSelect, selectedLevels, onToggleLevel }: Props) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap', marginBottom: '12px' }}>
      {days.map((day, i) => (
        <button
          key={day.date}
          onClick={() => onSelect(i)}
          style={{
            padding: '4px 12px',
            background: i === activeIndex ? '#e0e0e0' : '#2a2a2a',
            color: i === activeIndex ? '#121212' : '#e0e0e0',
            border: '1px solid #444',
            borderRadius: '4px',
            fontWeight: i === activeIndex ? 700 : 400,
            cursor: 'pointer',
          }}
        >
          {formatDayLabel(day.date)}
        </button>
      ))}
      <div style={{ marginLeft: 'auto', display: 'flex', gap: '8px' }}>
        {FILTER_LEVELS.map((level) => {
          const active = selectedLevels.has(level);
          return (
            <button
              key={level}
              onClick={() => onToggleLevel(level)}
              style={{
                padding: '4px 12px',
                background: active ? BG[level] : '#2a2a2a',
                color: active ? ACTIVE_TEXT[level] : '#e0e0e0',
                border: `1px solid ${BORDER[level]}`,
                borderRadius: '4px',
                fontWeight: active ? 700 : 400,
                cursor: 'pointer',
              }}
            >
              {INTEREST_LABELS[level]}
            </button>
          );
        })}
      </div>
    </div>
  );
}
