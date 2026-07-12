import { useState } from "react";
import { useLineup } from "./hooks/useLineup";
import { useFestivals } from "./hooks/useFestivals";
import { useConsent } from "./hooks/useConsent";
import Editor from "./components/Editor";
import Timeline from "./components/Timeline";
import DayTabs from "./components/DayTabs";
import FestivalTabs from "./components/FestivalTabs";
import { findActiveDay } from "./lib/dayWindow";
import type { Festival, InterestLevel } from "./types";
import "./App.css";

function App() {
  const { consent, accept, decline } = useConsent();
  const consented = consent === "accepted";
  const { festivals, activeId, setActiveId, createFestival, renameFestival, deleteFestival } = useFestivals(consented);
  const { festival, interestMap, seenMap, setFestival: setFestivalRaw, setFestivalFor, setInterest, setSeen, clearStorage } = useLineup(
    activeId,
    consented,
  );

  // Every festival write also keeps the switcher's name label in sync, so
  // renaming (or importing under a new name) doesn't require a second step.
  const setFestival = (f: Festival | null) => {
    setFestivalRaw(f);
    if (f?.name) renameFestival(activeId, f.name);
  };

  const handleDeleteFestival = () => {
    const meta = festivals.find(f => f.id === activeId);
    if (!window.confirm(`Delete festival "${meta?.name ?? ""}" and all its data? This cannot be undone.`)) return;
    deleteFestival(activeId);
  };

  const handlePrivacyReset = () => {
    if (!window.confirm("This deletes all saved festivals and lineups from this browser. Continue?")) return;
    try {
      localStorage.removeItem("festival_index");
      localStorage.removeItem("active_festival_id");
      localStorage.removeItem("consent");
      Object.keys(localStorage)
        .filter(k => k.startsWith("lineup_"))
        .forEach(k => localStorage.removeItem(k));
    } catch { /* ignore */ }
    window.location.reload();
  };

  const [activeDay, setActiveDay] = useState(() => findActiveDay(festival?.days ?? [], new Date())?.dayIndex ?? 0);
  const [scrollToMinutes, setScrollToMinutes] = useState<number | undefined>(() => findActiveDay(festival?.days ?? [], new Date())?.offsetMinutes);
  const [selectedLevels, setSelectedLevels] = useState<Set<InterestLevel>>(new Set());
  const [showHelp, setShowHelp] = useState(false);
  const [loadedFestivalId, setLoadedFestivalId] = useState(activeId);

  // Switching festivals should re-run the "jump to today" logic against the
  // newly active festival's own days, same as on first load.
  if (activeId !== loadedFestivalId) {
    setLoadedFestivalId(activeId);
    const active = findActiveDay(festival?.days ?? [], new Date());
    setActiveDay(active?.dayIndex ?? 0);
    setScrollToMinutes(active?.offsetMinutes);
  }

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
          <FestivalTabs festivals={festivals} activeId={activeId} onSelect={setActiveId} />
          <button className="help-btn" onClick={() => setShowHelp(true)}>
            Help
          </button>
        </div>
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
          {currentDay && (
            <Timeline
              day={currentDay}
              interestMap={interestMap}
              setInterest={setInterest}
              seenMap={seenMap}
              setSeen={setSeen}
              selectedLevels={selectedLevels}
              scrollToMinutes={scrollToMinutes}
            />
          )}
        </>
      )}
      <Editor
        festival={festival}
        setFestival={setFestival}
        festivalId={activeId}
        onCreateFestival={createFestival}
        onSetFestivalFor={setFestivalFor}
        onDeleteFestival={handleDeleteFestival}
      />
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
        <button className="footer-privacy-btn" onClick={handlePrivacyReset}>
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
                <strong>Multiple festivals</strong> — use the tabs next to
                the title to switch between up to 4 festivals. Add or delete
                festivals from the Import/Edit section below.
              </li>
              <li>
                <strong>Import lineup</strong> — open the Import/Edit section,
                click one of the "Import festival" tabs to load a lineup
                published on the site in one click, or paste your own lineup
                (day headers as DD.MM.YYYY or YYYY-MM-DD) and click Import.
              </li>
              <li>
                <strong>Add manually</strong> — pick a date, stage, band name
                and times under "Add manually"; it adds to whichever festival
                tab is currently selected.
              </li>
              <li>
                <strong>Rename</strong> — open the Import/Edit section and
                click ✎ next to the festival name or any stage heading to
                rename it everywhere it appears.
              </li>
              <li>
                <strong>Edit &amp; delete acts</strong> — in the Import/Edit
                section, edit (✎) or delete (×) individual acts, or use
                "Delete festival" to remove the whole festival.
              </li>
              <li>
                <strong>Mark interest &amp; seen</strong> — click an act to
                cycle through interest levels; the small ✓ badge on each act
                marks it as seen.
              </li>
              <li>
                <strong>Switch days</strong> — use the day tabs at the top;
                the app jumps to the current day and time automatically if a
                festival is running right now.
              </li>
              <li>
                <strong>Filter</strong> — toggle Not interested / Maybe /
                Interested / Must-see (the color boxes show which is which) to
                show only acts at those interest levels.
              </li>
            </ul>
          </div>
        </div>
      )}
      {consent === null && (
        <div className="consent-banner">
          <span>
            <strong>We save data in your browser.</strong> If you agree,
            you keep your saved lineup and picks next time. If you decline,
            everything clears when you close the tab — the app still
            works.{" "}
            <a href="https://argimlas.de/datenschutz.html">Privacy Policy</a>
          </span>
          <div className="consent-actions">
            <button onClick={accept}>I accept saving my data</button>
            <button onClick={() => { clearStorage(); decline(); }}>I decline saving my data</button>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
