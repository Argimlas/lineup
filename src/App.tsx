import { useLineup } from './hooks/useLineup';
import Editor from './components/Editor';
import Timeline from './components/Timeline';

function App() {
  const { festival, interestMap, setFestival } = useLineup();
  const firstDay = festival?.days[0] ?? null;
  return (
    <div>
      <h1>Lineup</h1>
      <Editor festival={festival} setFestival={setFestival} />
      {firstDay && <Timeline day={firstDay} interestMap={interestMap} />}
    </div>
  );
}

export default App;
