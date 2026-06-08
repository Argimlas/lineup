import type { Day } from '../types';

interface Props {
  days: Day[];
  activeIndex: number;
  onSelect: (index: number) => void;
  hideUnmarked: boolean;
  onToggleFilter: () => void;
}

export default function DayTabs({ days, activeIndex, onSelect, hideUnmarked, onToggleFilter }: Props) {
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
      <button
        onClick={onToggleFilter}
        style={{
          marginLeft: 'auto',
          padding: '4px 12px',
          background: hideUnmarked ? '#1a3a1a' : '#2a2a2a',
          color: hideUnmarked ? '#6f6' : '#e0e0e0',
          border: `1px solid ${hideUnmarked ? '#163' : '#444'}`,
          borderRadius: '4px',
          cursor: 'pointer',
        }}
      >
        {hideUnmarked ? 'Filter: an' : 'Filter: aus'}
      </button>
    </div>
  );
}
