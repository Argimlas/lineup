import { useState } from "react";
import { useLineup } from "./hooks/useLineup";
import { useConsent } from "./hooks/useConsent";
import Editor from "./components/Editor";
import Timeline from "./components/Timeline";
import DayTabs from "./components/DayTabs";
import { BG, BORDER, INTEREST_LABELS } from "./components/BandCard";
import type { InterestLevel } from "./types";
import "./App.css";

function App() {
  const { consent, accept, decline, reset } = useConsent();
  const { festival, interestMap, seenMap, setFestival, setInterest, setSeen, clearStorage } = useLineup(
    "default",
    consent === "accepted",
  );
  const [activeDay, setActiveDay] = useState(0);
  const [selectedLevels, setSelectedLevels] = useState<Set<InterestLevel>>(new Set());
  const [showHelp, setShowHelp] = useState(false);

  const toggleLevel = (level: InterestLevel) => {
    setSelectedLevels((prev) => {
      const next = new Set(prev);
      if (next.has(level)) next.delete(level);
      else next.add(level);
      return next;
    });
  };

  const days = festival?.days ?? [];
  const currentDay = days[activeDay] ?? null;

  return (
    <div className="app">
      <header className="app-header">
        <div className="app-header-row">
          <h1>Lineup</h1>
          <button className="help-btn" onClick={() => setShowHelp(true)}>
            ?
          </button>
        </div>
        {festival?.name && <p className="festival-name">{festival.name}</p>}
      </header>
      {days.length > 0 && (
        <>
          <DayTabs
            days={days}
            activeIndex={activeDay}
            onSelect={setActiveDay}
            selectedLevels={selectedLevels}
            onToggleLevel={toggleLevel}
          />
          <div className="interest-legend">
            {([0, 1, 2, 3] as InterestLevel[]).map((level) => (
              <span key={level}>
                <span
                  className="interest-dot"
                  style={{
                    background: BG[level],
                    border: `1px solid ${BORDER[level]}`,
                  }}
                />
                {INTEREST_LABELS[level]}
              </span>
            ))}
          </div>
          {currentDay && (
            <Timeline
              day={currentDay}
              interestMap={interestMap}
              setInterest={setInterest}
              seenMap={seenMap}
              setSeen={setSeen}
              selectedLevels={selectedLevels}
            />
          )}
        </>
      )}
      <Editor festival={festival} setFestival={setFestival} />
      <footer className="app-footer">
        <a
          href="https://github.com/Argimlas/lineup"
          target="_blank"
          rel="noopener noreferrer"
        >
          GitHub
        </a>
        <a href="https://argimlas.de/datenschutz.html">Privacy Policy</a>
        <a href="https://argimlas.de/impressum.html">Imprint</a>
        <button className="footer-privacy-btn" onClick={reset}>
          Privacy settings
        </button>
      </footer>
      {showHelp && (
        <div className="help-overlay" onClick={() => setShowHelp(false)}>
          <div className="help-modal" onClick={(e) => e.stopPropagation()}>
            <button className="help-close" onClick={() => setShowHelp(false)}>
              ✕
            </button>
            <h2>How to use</h2>
            <ul>
              <li>
                <strong>Import lineup</strong> — open the Import section, enter
                a festival name, paste your lineup text and click Import.
              </li>
              <li>
                <strong>Add manually</strong> — open "Add manually" to add
                individual acts by day, stage, name and time.
              </li>
              <li>
                <strong>Edit &amp; delete</strong> — open the Lineup section to
                edit (✎) or delete (×) individual acts, or use "Delete all" to
                start over.
              </li>
              <li>
                <strong>Mark interest</strong> — click any act on the timeline
                to cycle through interest levels.
              </li>
              <li>
                <strong>Switch days</strong> — use the day tabs at the top to
                switch between festival days.
              </li>
              <li>
                <strong>Filter</strong> — toggle Maybe / Interested / Must-see
                to show only acts at those interest levels (combine multiple,
                or select none to show everything).
              </li>
            </ul>
          </div>
        </div>
      )}
      {consent === null && (
        <div className="consent-banner">
          <span>
            <strong>We save data in your browser.</strong> With your consent,
            this app saves your festival interest selections so they persist
            between visits. Without consent, the app still works but your
            selections are cleared when you close the tab.{" "}
            <a href="#privacy">Privacy Policy</a>
          </span>
          <div className="consent-actions">
            <button onClick={accept}>I accept</button>
            <button onClick={() => { clearStorage(); decline(); }}>I decline</button>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
