import { useState } from 'react';
import { useLineup } from './hooks/useLineup';
import Editor from './components/Editor';
import Timeline from './components/Timeline';
import DayTabs from './components/DayTabs';
import { BG, BORDER, INTEREST_LABELS } from './components/BandCard';
import type { InterestLevel } from './types';
import './App.css';

function App() {
  const { festival, interestMap, setFestival, setInterest } = useLineup();
  const [activeDay, setActiveDay] = useState(0);
  const [hideUnmarked, setHideUnmarked] = useState(false);

  const days = festival?.days ?? [];
  const currentDay = days[activeDay] ?? null;

  return (
    <div className="app">
      <h1>Lineup</h1>
      <Editor festival={festival} setFestival={setFestival} />
      {days.length > 0 && (
        <>
          <DayTabs
            days={days}
            activeIndex={activeDay}
            onSelect={setActiveDay}
            hideUnmarked={hideUnmarked}
            onToggleFilter={() => setHideUnmarked(v => !v)}
          />
          <div className="interest-legend">
            {([0, 1, 2, 3] as InterestLevel[]).map(level => (
              <span key={level}>
                <span className="interest-dot" style={{ background: BG[level], border: `1px solid ${BORDER[level]}` }} />
                {INTEREST_LABELS[level]}
              </span>
            ))}
          </div>
          {currentDay && (
            <Timeline
              day={currentDay}
              interestMap={interestMap}
              setInterest={setInterest}
              hideUnmarked={hideUnmarked}
            />
          )}
        </>
      )}
    </div>
  );
}

export default App;
