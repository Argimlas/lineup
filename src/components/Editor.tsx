import { useState } from 'react';
import type { Festival, Act } from '../types';
import { parseLineup } from '../lib/parser';
import { serializeLineup } from '../lib/serialize';
import { formatTime } from '../lib/time';
import { formatDayLabel } from '../lib/date';

interface Props {
  festival: Festival | null;
  setFestival: (f: Festival | null) => void;
}

function parseTime(s: string): number | null {
  if (!s.includes(':')) return null;
  const [h, m] = s.split(':');
  const hours = parseInt(h, 10);
  const mins = parseInt(m, 10);
  return isNaN(hours) || isNaN(mins) ? null : hours * 60 + mins;
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

function updateAct(festival: Festival, actId: string, changes: { name: string; stage: string; startTime: number; endTime: number }): Festival {
  const day = festival.days.find(d => d.stages.some(s => s.acts.some(a => a.id === actId)));
  if (!day) return festival;
  const newAct: Act = { id: `${day.date}|${changes.stage}|${changes.name}|${changes.startTime}`, ...changes };
  return addAct(deleteAct(festival, actId), day.date, changes.stage, newAct);
}

function renameStage(festival: Festival, oldName: string, newName: string): Festival {
  return {
    ...festival,
    days: festival.days.map(day => ({
      ...day,
      stages: day.stages.map(stage =>
        stage.name === oldName
          ? { ...stage, name: newName, acts: stage.acts.map(act => ({ ...act, stage: newName })) }
          : stage
      ),
    })),
  };
}

function addAct(festival: Festival | null, dayDate: string, stageName: string, act: Act): Festival {
  const base: Festival = festival ?? { id: 'default', name: 'Festival', days: [] };
  const days = base.days;

  const mergeStage = (stages: Festival['days'][0]['stages']) => {
    const existing = stages.find(s => s.name === stageName);
    if (existing) {
      return stages.map(s => s.name === stageName ? { ...s, acts: [...s.acts, act] } : s);
    }
    return [...stages, { name: stageName, acts: [act] }];
  };

  const existingDay = days.find(d => d.date === dayDate);
  const newDays = existingDay
    ? days.map(d => d.date === dayDate ? { ...d, stages: mergeStage(d.stages) } : d)
    : [...days, { date: dayDate, stages: [{ name: stageName, acts: [act] }] }];

  return { ...base, days: newDays };
}

const emptyForm = { day: '', stage: '', name: '', start: '', end: '' };

export default function Editor({ festival, setFestival }: Props) {
  const [pasteText, setPasteText] = useState('');
  const [prevFestival, setPrevFestival] = useState(festival);
  const [festivalName, setFestivalName] = useState(festival?.name ?? 'Festival');
  if (festival !== prevFestival) {
    setPrevFestival(festival);
    setFestivalName(festival?.name ?? 'Festival');
  }
  const [form, setForm] = useState(emptyForm);
  const [formError, setFormError] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState({ name: '', stage: '', start: '', end: '' });
  const [editError, setEditError] = useState('');
  const [copied, setCopied] = useState(false);
  const [editingStageKey, setEditingStageKey] = useState<string | null>(null);
  const [editingStageOldName, setEditingStageOldName] = useState('');
  const [stageNameDraft, setStageNameDraft] = useState('');
  const [editingFestivalName, setEditingFestivalName] = useState(false);
  const [festivalNameEditDraft, setFestivalNameEditDraft] = useState('');

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
    if (startTime === null || endTime === null) {
      setFormError('Enter times in HH:mm format (e.g. 21:00).');
      return;
    }
    const resolvedEnd = endTime <= startTime ? endTime + 1440 : endTime;
    setFormError('');
    const act: Act = {
      id: `${day}|${stage}|${name}|${startTime}`,
      name: name.trim(),
      stage: stage.trim(),
      startTime,
      endTime: resolvedEnd,
    };
    setFestival(addAct(festival, day.trim(), stage.trim(), act));
    setForm(emptyForm);
  };

  const handleCopy = () => {
    if (!festival) return;
    navigator.clipboard.writeText(serializeLineup(festival)).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    });
  };

  const handleDelete = (actId: string, actName: string) => {
    if (!festival) return;
    if (!window.confirm(`Delete ${actName}?`)) return;
    setFestival(deleteAct(festival, actId));
  };

  const startEdit = (act: Act) => {
    setEditingId(act.id);
    setEditForm({ name: act.name, stage: act.stage, start: formatTime(act.startTime), end: formatTime(act.endTime) });
    setEditError('');
  };

  const handleSaveEdit = () => {
    if (!festival || !editingId) return;
    const startTime = parseTime(editForm.start);
    const endTime = parseTime(editForm.end);
    if (startTime === null || endTime === null) { setEditError('Enter times in HH:mm format.'); return; }
    const resolvedEnd = endTime <= startTime ? endTime + 1440 : endTime;
    setFestival(updateAct(festival, editingId, { name: editForm.name.trim(), stage: editForm.stage.trim(), startTime, endTime: resolvedEnd }));
    setEditingId(null);
    setEditError('');
  };

  const startStageEdit = (key: string, name: string) => {
    setEditingStageKey(key);
    setEditingStageOldName(name);
    setStageNameDraft(name);
  };

  const handleSaveStageEdit = () => {
    if (!festival || !editingStageKey) return;
    const trimmed = stageNameDraft.trim();
    if (trimmed && trimmed !== editingStageOldName) setFestival(renameStage(festival, editingStageOldName, trimmed));
    setEditingStageKey(null);
  };

  const handleSaveFestivalName = () => {
    if (!festival) return;
    setFestival({ ...festival, name: festivalNameEditDraft.trim() || festival.name });
    setEditingFestivalName(false);
  };

  return (
    <div className="editor">
      <details>
        <summary>Lineup</summary>
        {festival && (
          editingFestivalName ? (
            <div className="edit-inline">
              <input value={festivalNameEditDraft} onChange={e => setFestivalNameEditDraft(e.target.value)} autoFocus />
              <button onClick={handleSaveFestivalName}>✓</button>
              <button onClick={() => setEditingFestivalName(false)}>✕</button>
            </div>
          ) : (
            <p className="festival-name">
              {festival.name}
              <button
                className="icon-btn"
                onClick={() => {
                  setFestivalNameEditDraft(festival.name);
                  setEditingFestivalName(true);
                }}
              >
                ✎
              </button>
            </p>
          )
        )}
        {festival && festival.days.length > 0 && (
          <div style={{ display: 'flex', gap: 8, marginBottom: 8 }}>
            <button
              onClick={() => {
                if (window.confirm('Delete the entire lineup?')) setFestival(null);
              }}
              style={{ background: '#5a1a1a', color: '#e07070', border: '1px solid #7a2a2a', borderRadius: 4, padding: '3px 10px', cursor: 'pointer', fontSize: '0.85rem' }}
            >
              Delete all
            </button>
            <button
              onClick={handleCopy}
              style={{ background: '#1a3a2a', color: '#6fc9a0', border: '1px solid #2a5a3a', borderRadius: 4, padding: '3px 10px', cursor: 'pointer', fontSize: '0.85rem' }}
            >
              {copied ? 'Copied!' : 'Copy'}
            </button>
          </div>
        )}
        {!festival || festival.days.length === 0 ? (
          <p>No lineup entered yet.</p>
        ) : (
          festival.days.map(day => (
            <div key={day.date}>
              <h3>{formatDayLabel(day.date)}</h3>
              {day.stages.map((stage, stageIdx) => {
                const stageKey = `${day.date}::${stageIdx}`;
                return (
                <div key={stageKey}>
                  <h4>
                    {editingStageKey === stageKey ? (
                      <span className="edit-inline">
                        <input value={stageNameDraft} onChange={e => setStageNameDraft(e.target.value)} autoFocus />
                        <button onClick={handleSaveStageEdit}>✓</button>
                        <button onClick={() => setEditingStageKey(null)}>✕</button>
                      </span>
                    ) : (
                      <>
                        {stage.name}
                        <button className="icon-btn" onClick={() => startStageEdit(stageKey, stage.name)}>✎</button>
                      </>
                    )}
                  </h4>
                  <ul>
                    {stage.acts.map(act => (
                      <li key={act.id}>
                        {editingId === act.id ? (
                          <div className="edit-inline">
                            <input value={editForm.name} onChange={e => setEditForm(f => ({ ...f, name: e.target.value }))} placeholder="Band" />
                            <input value={editForm.stage} onChange={e => setEditForm(f => ({ ...f, stage: e.target.value }))} placeholder="Stage" />
                            <input value={editForm.start} onChange={e => setEditForm(f => ({ ...f, start: e.target.value }))} placeholder="Start" style={{ width: 70 }} />
                            <input value={editForm.end} onChange={e => setEditForm(f => ({ ...f, end: e.target.value }))} placeholder="Ende" style={{ width: 70 }} />
                            {editError && <span style={{ color: '#e07070', fontSize: '0.75rem' }}>{editError}</span>}
                            <button onClick={handleSaveEdit}>✓</button>
                            <button onClick={() => setEditingId(null)}>✕</button>
                          </div>
                        ) : (
                          <>
                            <span>{act.name} {formatTime(act.startTime)}–{formatTime(act.endTime)}</span>
                            <span className="act-actions">
                              <button onClick={() => startEdit(act)}>✎</button>
                              <button onClick={() => handleDelete(act.id, act.name)}>×</button>
                            </span>
                          </>
                        )}
                      </li>
                    ))}
                  </ul>
                </div>
                );
              })}
            </div>
          ))
        )}
      </details>

      <details>
        <summary>Import</summary>
        <input
          type="text"
          placeholder="Festival-Name"
          value={festivalName}
          onChange={e => setFestivalName(e.target.value)}
        />
        <textarea
          rows={10}
          placeholder={'10.07.2026\nMain Stage\nBand A, 21:00, 23:00'}
          value={pasteText}
          onChange={e => setPasteText(e.target.value)}
        />
        <button onClick={handleImport}>Import</button>
      </details>

      <details>
        <summary>Add manually</summary>
        <input type="date" value={form.day} onChange={e => setForm(f => ({ ...f, day: e.target.value }))} />
        <input placeholder="Stage" value={form.stage} onChange={e => setForm(f => ({ ...f, stage: e.target.value }))} />
        <input placeholder="Band" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} />
        <input placeholder="Start (HH:mm)" value={form.start} onChange={e => setForm(f => ({ ...f, start: e.target.value }))} />
        <input placeholder="End (HH:mm)" value={form.end} onChange={e => setForm(f => ({ ...f, end: e.target.value }))} />
        <button onClick={handleAdd}>Add</button>
        {formError && <p style={{ color: '#e07070', fontSize: '0.8rem', margin: '4px 0 0' }}>{formError}</p>}
      </details>
    </div>
  );
}
