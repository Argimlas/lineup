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

const FILTER_LEVELS: InterestLevel[] = [3, 2, 1, 0];
const ACCENT: Record<InterestLevel, string> = { 0: '#aaa', 1: '#5fa8ff', 2: '#e8c547', 3: '#6f6' };

export default function DayTabs({ days, activeIndex, onSelect, selectedLevels, onToggleLevel }: Props) {
  return (
    <div className="day-tabs-row">
      {days.map((day, i) => (
        <button
          key={day.date}
          className={`day-tab${i === activeIndex ? ' active' : ''}`}
          onClick={() => onSelect(i)}
        >
          {formatDayLabel(day.date)}
        </button>
      ))}
      <div className="filter-group">
        <span className="filter-label">Filter:</span>
        {FILTER_LEVELS.map((level) => {
          const active = selectedLevels.has(level);
          return (
            <button
              key={level}
              className={`filter-btn${active ? ' active' : ''}`}
              onClick={() => onToggleLevel(level)}
              style={{
                background: BG[level],
                color: active ? ACCENT[level] : '#e0e0e0',
                border: active ? `2px solid ${ACCENT[level]}` : `1px solid ${BORDER[level]}`,
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
