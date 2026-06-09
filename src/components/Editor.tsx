import { useState } from 'react';
import type { Festival, Act } from '../types';
import { parseLineup } from '../lib/parser';

interface Props {
  festival: Festival | null;
  setFestival: (f: Festival | null) => void;
}

function minutesToTime(m: number): string {
  const h = Math.floor(m / 60) % 24;
  const min = m % 60;
  return `${String(h).padStart(2, '0')}:${String(min).padStart(2, '0')}`;
}

function parseTime(s: string): number {
  const [h, m] = s.split(':');
  const hours = parseInt(h, 10);
  const mins = parseInt(m, 10);
  return isNaN(hours) || isNaN(mins) ? 0 : hours * 60 + mins;
}

function deleteAct(festival: Festival, actId: string): Festival {
  return {
    ...festival,
    days: festival.days.map(day => ({
      ...day,
      stages: day.stages
        .map(stage => ({ ...stage, acts: stage.acts.filter(a => a.id !== actId) }))
        .filter(stage => stage.acts.length > 0),
    })).filter(day => day.stages.length > 0),
  };
}

function addAct(festival: Festival | null, dayName: string, stageName: string, act: Act): Festival {
  const base: Festival = festival ?? { id: 'default', name: 'Festival', days: [] };
  const days = base.days;

  const mergeStage = (stages: Festival['days'][0]['stages']) => {
    const existing = stages.find(s => s.name === stageName);
    if (existing) {
      return stages.map(s => s.name === stageName ? { ...s, acts: [...s.acts, act] } : s);
    }
    return [...stages, { name: stageName, acts: [act] }];
  };

  const existingDay = days.find(d => d.name === dayName);
  const newDays = existingDay
    ? days.map(d => d.name === dayName ? { ...d, stages: mergeStage(d.stages) } : d)
    : [...days, { name: dayName, stages: [{ name: stageName, acts: [act] }] }];

  return { ...base, days: newDays };
}

const emptyForm = { day: '', stage: '', name: '', start: '', end: '' };

export default function Editor({ festival, setFestival }: Props) {
  const [pasteText, setPasteText] = useState('');
  const [festivalName, setFestivalName] = useState(festival?.name ?? 'Festival');
  const [form, setForm] = useState(emptyForm);

  const handleImport = () => {
    if (!pasteText.trim()) return;
    setFestival(parseLineup(pasteText, festivalName));
    setPasteText('');
  };

  const handleAdd = () => {
    const { day, stage, name, start, end } = form;
    if (!day.trim() || !stage.trim() || !name.trim()) return;
    const startTime = parseTime(start);
    const endTime = parseTime(end);
    const act: Act = {
      id: `${day}|${stage}|${name}|${startTime}`,
      name: name.trim(),
      stage: stage.trim(),
      startTime,
      endTime,
    };
    setFestival(addAct(festival, day.trim(), stage.trim(), act));
    setForm(emptyForm);
  };

  const handleDelete = (actId: string) => {
    if (festival) setFestival(deleteAct(festival, actId));
  };

  return (
    <div className="editor">
      <section>
        <h2>Import</h2>
        <input
          type="text"
          placeholder="Festival-Name"
          value={festivalName}
          onChange={e => setFestivalName(e.target.value)}
        />
        <textarea
          rows={10}
          placeholder={'Freitag\nMain Stage\nBand A, 21:00, 23:00'}
          value={pasteText}
          onChange={e => setPasteText(e.target.value)}
        />
        <button onClick={handleImport}>Importieren</button>
      </section>

      <section>
        <h2>Manuell hinzufügen</h2>
        <input placeholder="Tag" value={form.day} onChange={e => setForm(f => ({ ...f, day: e.target.value }))} />
        <input placeholder="Stage" value={form.stage} onChange={e => setForm(f => ({ ...f, stage: e.target.value }))} />
        <input placeholder="Band" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} />
        <input placeholder="Start (HH:mm)" value={form.start} onChange={e => setForm(f => ({ ...f, start: e.target.value }))} />
        <input placeholder="Ende (HH:mm)" value={form.end} onChange={e => setForm(f => ({ ...f, end: e.target.value }))} />
        <button onClick={handleAdd}>Hinzufügen</button>
      </section>

      <section>
        <h2>Lineup</h2>
        {!festival || festival.days.length === 0 ? (
          <p>Noch kein Lineup eingegeben.</p>
        ) : (
          festival.days.map(day => (
            <div key={day.name}>
              <h3>{day.name}</h3>
              {day.stages.map(stage => (
                <div key={stage.name}>
                  <h4>{stage.name}</h4>
                  <ul>
                    {stage.acts.map(act => (
                      <li key={act.id}>
                        {act.name} {minutesToTime(act.startTime)}–{minutesToTime(act.endTime)}
                        <button onClick={() => handleDelete(act.id)}>×</button>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          ))
        )}
      </section>
    </div>
  );
}
