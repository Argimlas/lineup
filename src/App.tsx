import { useLineup } from './hooks/useLineup';
import Editor from './components/Editor';

function App() {
  const { festival, setFestival } = useLineup();
  return (
    <div>
      <h1>Lineup</h1>
      <Editor festival={festival} setFestival={setFestival} />
    </div>
  );
}

export default App;
