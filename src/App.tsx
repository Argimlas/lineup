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
  const [showHelp, setShowHelp] = useState(false);

  const days = festival?.days ?? [];
  const currentDay = days[activeDay] ?? null;

  return (
    <div className="app">
      <header className="app-header">
        <div className="app-header-row">
          <h1>Lineup</h1>
          <button className="help-btn" onClick={() => setShowHelp(true)}>?</button>
        </div>
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
      {showHelp && (
        <div className="help-overlay" onClick={() => setShowHelp(false)}>
          <div className="help-modal" onClick={e => e.stopPropagation()}>
            <button className="help-close" onClick={() => setShowHelp(false)}>✕</button>
            <h2>How to use</h2>
            <ul>
              <li><strong>Import lineup</strong> — open the Import section, paste your lineup text and click Import.</li>
              <li><strong>Mark interest</strong> — click any act on the timeline to cycle through interest levels.</li>
              <li><strong>Switch days</strong> — use the day tabs at the top to switch between festival days.</li>
              <li><strong>Filter</strong> — toggle "Filter" to show only acts you've marked.</li>
            </ul>
          </div>
        </div>
      )}
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
