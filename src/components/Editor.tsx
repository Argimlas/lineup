import { useState, useEffect } from 'react';
import type { Festival, Act } from '../types';
import { parseLineup } from '../lib/parser';
import { serializeLineup } from '../lib/serialize';
import { formatTime, parseTimeToMinutes } from '../lib/time';
import { formatDayLabel } from '../lib/date';
import { deleteAct, addAct, updateAct, renameStage } from '../lib/festival';
import { fetchPresetManifest, fetchPresetLineup, type PresetMeta } from '../lib/presets';

interface Props {
  festival: Festival | null;
  setFestival: (f: Festival | null) => void;
  festivalId: string;
  onCreateFestival: (name: string) => string | null;
  onSetFestivalFor: (id: string, festival: Festival) => void;
  onDeleteFestival: () => void;
}

const emptyForm = { day: '', stage: '', name: '', start: '', end: '' };

const onEnterKey = (handler: () => void) => (e: React.KeyboardEvent) => {
  if (e.key === 'Enter') handler();
};

const EXAMPLE_LINEUP = `10.07.2026
Main Stage
Band A, 20:00, 21:30
Band B, 22:00, 23:30
Second Stage
Band C, 21:00, 22:00

11.07.2026
Main Stage
Band D, 19:00, 20:00
Band E, 23:00, 01:00
Band H, 01:15, 02:00
Second Stage
Band F, 20:30, 22:00
Band G, 22:30, 00:00`;

export default function Editor({ festival, setFestival, festivalId, onCreateFestival, onSetFestivalFor, onDeleteFestival }: Props) {
  const [pasteText, setPasteText] = useState('');
  const [presets, setPresets] = useState<PresetMeta[]>([]);
  const [presetError, setPresetError] = useState('');
  const [pendingPreset, setPendingPreset] = useState<PresetMeta | null>(null);

  useEffect(() => {
    fetchPresetManifest().then(setPresets);
  }, []);
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
  const [showExample, setShowExample] = useState(false);

  const handleImport = () => {
    if (!pasteText.trim()) return;
    setFestival(parseLineup(pasteText, festivalName, festivalId));
    setPasteText('');
  };

  const loadPresetInto = (preset: PresetMeta, target: 'current' | 'new') => {
    setPresetError('');
    fetchPresetLineup(preset.file)
      .then(text => {
        if (target === 'current') {
          setFestival(parseLineup(text, preset.name, festivalId));
          return;
        }
        const newId = onCreateFestival(preset.name);
        if (!newId) {
          alert('You can only have up to 4 festivals.');
          return;
        }
        onSetFestivalFor(newId, parseLineup(text, preset.name, newId));
      })
      .catch(() => setPresetError('Could not load this lineup.'));
  };

  const handlePresetTabClick = (preset: PresetMeta) => {
    if (festival && festival.days.length > 0) {
      setPendingPreset(preset);
      return;
    }
    loadPresetInto(preset, 'current');
  };

  const handleNewFestivalClick = () => {
    const name = window.prompt('Name for the new festival?', 'New Festival');
    if (!name || !name.trim()) return;
    if (!onCreateFestival(name.trim())) alert('You can only have up to 4 festivals.');
  };

  const handleAdd = () => {
    const { day, stage, name, start, end } = form;
    if (!day.trim() || !stage.trim() || !name.trim()) return;
    const startTime = parseTimeToMinutes(start);
    const endTime = parseTimeToMinutes(end);
    if (startTime === null || endTime === null) {
      setFormError('Enter times in HH:mm format (e.g. 21:00).');
      return;
    }
    const resolvedEnd = endTime <= startTime ? endTime + 1440 : endTime;
    setFormError('');
    const act = { name: name.trim(), startTime, endTime: resolvedEnd };
    setFestival(addAct(festival, day.trim(), stage.trim(), act, festivalId));
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
    const startTime = parseTimeToMinutes(editForm.start);
    const endTime = parseTimeToMinutes(editForm.end);
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
        <summary>Import/Edit</summary>
        <h3>Import festival</h3>
        <div className="preset-tabs-row">
          {presets.slice(0, 4).map(p => (
            <button key={p.id} type="button" className="preset-tab" onClick={() => handlePresetTabClick(p)}>
              {p.name}
            </button>
          ))}
          <button type="button" className="preset-tab preset-tab-new" onClick={handleNewFestivalClick}>
            + New festival
          </button>
        </div>
        {presetError && <p className="preset-error">{presetError}</p>}
        <div className="import-row">
          <input
            type="text"
            placeholder="Festival name"
            value={festivalName}
            onChange={e => setFestivalName(e.target.value)}
          />
          <textarea
            rows={1}
            placeholder="Paste lineup..."
            value={pasteText}
            onChange={e => setPasteText(e.target.value)}
          />
          <div className="import-row-actions">
            <button onClick={handleImport}>Import</button>
            <button
              type="button"
              onClick={() => setShowExample(s => !s)}
              title="Show example format"
            >
              ?
            </button>
          </div>
        </div>
        {showExample && <pre className="import-example">{EXAMPLE_LINEUP}</pre>}
        {festival && (
          editingFestivalName ? (
            <div className="edit-inline edit-inline-compact">
              <input
                value={festivalNameEditDraft}
                onChange={e => setFestivalNameEditDraft(e.target.value)}
                onKeyDown={onEnterKey(handleSaveFestivalName)}
                autoFocus
              />
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
        <div style={{ display: 'flex', gap: 8, marginTop: 16, marginBottom: 8 }}>
          <button
            onClick={onDeleteFestival}
            style={{ background: '#5a1a1a', color: '#e07070', border: '1px solid #7a2a2a', borderRadius: 4, padding: '3px 10px', cursor: 'pointer', fontSize: '0.85rem' }}
          >
            Delete festival
          </button>
          {festival && festival.days.length > 0 && (
            <button
              onClick={handleCopy}
              style={{ background: '#1a3a2a', color: '#6fc9a0', border: '1px solid #2a5a3a', borderRadius: 4, padding: '3px 10px', cursor: 'pointer', fontSize: '0.85rem' }}
            >
              {copied ? 'Copied!' : 'Copy lineup'}
            </button>
          )}
        </div>
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
                      <span className="edit-inline edit-inline-compact">
                        <input
                          value={stageNameDraft}
                          onChange={e => setStageNameDraft(e.target.value)}
                          onKeyDown={onEnterKey(handleSaveStageEdit)}
                          autoFocus
                        />
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
                            <input value={editForm.name} onChange={e => setEditForm(f => ({ ...f, name: e.target.value }))} onKeyDown={onEnterKey(handleSaveEdit)} placeholder="Band" />
                            <input value={editForm.stage} onChange={e => setEditForm(f => ({ ...f, stage: e.target.value }))} onKeyDown={onEnterKey(handleSaveEdit)} placeholder="Stage" />
                            <input value={editForm.start} onChange={e => setEditForm(f => ({ ...f, start: e.target.value }))} onKeyDown={onEnterKey(handleSaveEdit)} placeholder="Start" style={{ width: 70 }} />
                            <input value={editForm.end} onChange={e => setEditForm(f => ({ ...f, end: e.target.value }))} onKeyDown={onEnterKey(handleSaveEdit)} placeholder="Ende" style={{ width: 70 }} />
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
        <summary>Add manually</summary>
        <input type="date" value={form.day} onChange={e => setForm(f => ({ ...f, day: e.target.value }))} />
        <input placeholder="Stage" value={form.stage} onChange={e => setForm(f => ({ ...f, stage: e.target.value }))} />
        <input placeholder="Band" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} />
        <input placeholder="Start (HH:mm)" value={form.start} onChange={e => setForm(f => ({ ...f, start: e.target.value }))} />
        <input placeholder="End (HH:mm)" value={form.end} onChange={e => setForm(f => ({ ...f, end: e.target.value }))} />
        <button onClick={handleAdd}>Add</button>
        {formError && <p style={{ color: '#e07070', fontSize: '0.8rem', margin: '4px 0 0' }}>{formError}</p>}
      </details>

      {pendingPreset && (
        <div className="confirm-overlay" onClick={() => setPendingPreset(null)}>
          <div className="confirm-modal" onClick={e => e.stopPropagation()}>
            <p>
              "{pendingPreset.name}" — this festival already has a lineup. What do you want to do?
            </p>
            <div className="confirm-actions">
              <button onClick={() => { loadPresetInto(pendingPreset, 'current'); setPendingPreset(null); }}>
                Override current
              </button>
              <button onClick={() => { loadPresetInto(pendingPreset, 'new'); setPendingPreset(null); }}>
                Load as new festival
              </button>
              <button onClick={() => setPendingPreset(null)}>Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
