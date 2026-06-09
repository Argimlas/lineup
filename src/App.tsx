import { useState } from 'react';
import { useLineup } from './hooks/useLineup';
import { useConsent } from './hooks/useConsent';
import Editor from './components/Editor';
import Timeline from './components/Timeline';
import DayTabs from './components/DayTabs';
import { BG, BORDER, INTEREST_LABELS } from './components/BandCard';
import type { InterestLevel } from './types';
import './App.css';

function App() {
  const { consent, accept, decline } = useConsent();
  const { festival, interestMap, setFestival, setInterest } = useLineup('default', consent === 'accepted');
  const [activeDay, setActiveDay] = useState(0);
  const [hideUnmarked, setHideUnmarked] = useState(false);

  const days = festival?.days ?? [];
  const currentDay = days[activeDay] ?? null;

  return (
    <div className="app">
      <header className="app-header">
        <h1>Lineup</h1>
        {festival?.name && <p className="festival-name">{festival.name}</p>}
      </header>
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
      <Editor festival={festival} setFestival={setFestival} />
      <footer className="app-footer">
        <a href="https://github.com/Argimlas/lineup" target="_blank" rel="noopener noreferrer">GitHub</a>
        <a href="#privacy">Privacy Policy</a>
        <a href="#impressum">Impressum</a>
      </footer>
      {consent === null && (
        <div className="consent-banner">
          <span>This app saves your interest selections in your browser. <a href="#privacy">Privacy Policy</a></span>
          <div className="consent-actions">
            <button onClick={accept}>Accept</button>
            <button onClick={decline}>Decline</button>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
