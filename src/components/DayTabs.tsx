import type { Day, InterestLevel } from '../types';
import { INTEREST_LABELS } from './BandCard';

interface Props {
  days: Day[];
  activeIndex: number;
  onSelect: (index: number) => void;
  selectedLevels: Set<InterestLevel>;
  onToggleLevel: (level: InterestLevel) => void;
}

const FILTER_LEVELS: InterestLevel[] = [1, 2, 3];

export default function DayTabs({ days, activeIndex, onSelect, selectedLevels, onToggleLevel }: Props) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap', marginBottom: '12px' }}>
      {days.map((day, i) => (
        <button
          key={day.name}
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
          {day.name}
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
                background: active ? '#1a3a1a' : '#2a2a2a',
                color: active ? '#6f6' : '#e0e0e0',
                border: `1px solid ${active ? '#163' : '#444'}`,
                borderRadius: '4px',
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
