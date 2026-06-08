import { useState } from 'react';
import { useLineup } from './hooks/useLineup';
import Editor from './components/Editor';
import Timeline from './components/Timeline';
import DayTabs from './components/DayTabs';

function App() {
  const { festival, interestMap, setFestival, setInterest } = useLineup();
  const [activeDay, setActiveDay] = useState(0);
  const [hideUnmarked, setHideUnmarked] = useState(false);

  const days = festival?.days ?? [];
  const currentDay = days[activeDay] ?? null;

  return (
    <div>
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
