import { useState } from 'react';
import { useLineup } from './hooks/useLineup';
import Editor from './components/Editor';
import Timeline from './components/Timeline';
import DayTabs from './components/DayTabs';
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
          {currentDay && (
            <>
              <div className="interest-legend">
                <span><span className="interest-dot" style={{ background: '#2a2a2a', border: '1px solid #444' }} />kein Interesse</span>
                <span><span className="interest-dot" style={{ background: '#1e2a35' }} />ok</span>
                <span><span className="interest-dot" style={{ background: '#3a2e00' }} />hätt ich Lust</span>
                <span><span className="interest-dot" style={{ background: '#0a3318' }} />unbedingt</span>
              </div>
              <Timeline
                day={currentDay}
                interestMap={interestMap}
                setInterest={setInterest}
                hideUnmarked={hideUnmarked}
              />
            </>
          )}
        </>
      )}
    </div>
  );
}

export default App;
