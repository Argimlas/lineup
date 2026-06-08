import { useState, useEffect } from 'react';
import type { ReactNode } from 'react';
import type { Day, Act, InterestMap } from '../types';

interface Props {
  day: Day;
  interestMap: InterestMap;
}

function useIsMobile(): boolean {
  const [mobile, setMobile] = useState(() => window.matchMedia('(max-width: 767px)').matches);
  useEffect(() => {
    const mq = window.matchMedia('(max-width: 767px)');
    const handler = (e: MediaQueryListEvent) => setMobile(e.matches);
    mq.addEventListener('change', handler);
    return () => mq.removeEventListener('change', handler);
  }, []);
  return mobile;
}

function toLabel(m: number): string {
  return `${String(Math.floor(m / 60) % 24).padStart(2, '0')}:${String(m % 60).padStart(2, '0')}`;
}

function getTimeRange(day: Day): { start: number; end: number } {
  let start = Infinity, end = 0;
  for (const stage of day.stages) {
    for (const act of stage.acts) {
      if (act.startTime < start) start = act.startTime;
      if (act.endTime > end) end = act.endTime;
    }
  }
  return { start: Math.floor(start / 15) * 15, end: Math.ceil(end / 15) * 15 };
}

function assignLanes(acts: Act[]): Map<string, { lane: number; totalLanes: number }> {
  const sorted = [...acts].sort((a, b) => a.startTime - b.startTime);
  const laneEnds: number[] = [];
  const laneOf = new Map<string, number>();

  for (const act of sorted) {
    const free = laneEnds.findIndex(e => e <= act.startTime);
    const lane = free === -1 ? laneEnds.length : free;
    laneOf.set(act.id, lane);
    laneEnds[lane] = act.endTime;
  }

  const total = Math.max(1, laneEnds.length);
  const result = new Map<string, { lane: number; totalLanes: number }>();
  for (const [id, lane] of laneOf) result.set(id, { lane, totalLanes: total });
  return result;
}

const CELL = 40;
const LABEL = 80;
const HEADER = 32;
const INTEREST_BG: Record<number, string> = {
  0: '#2a2a2a',
  1: '#1a3a4a',
  2: '#3a2a0a',
  3: '#1a3a1a',
};

export default function Timeline({ day, interestMap }: Props) {
  const isMobile = useIsMobile();

  if (!day.stages.some(s => s.acts.length > 0)) {
    return <p>Kein Lineup für {day.name}.</p>;
  }

  const { start: rangeStart, end: rangeEnd } = getTimeRange(day);
  const slotCount = (rangeEnd - rangeStart) / 15;

  const stages = day.stages
    .filter(s => s.acts.length > 0)
    .map(stage => {
      const laneMap = assignLanes(stage.acts);
      const totalLanes = Math.max(...[...laneMap.values()].map(v => v.totalLanes));
      return { stage, laneMap, totalLanes };
    });

  const totalLanes = stages.reduce((n, s) => n + s.totalLanes, 0);

  const stageBases: number[] = [];
  let cursor = 2;
  for (const s of stages) { stageBases.push(cursor); cursor += s.totalLanes; }

  const gridStyle = isMobile
    ? {
        display: 'grid',
        gridTemplateRows: `${HEADER}px repeat(${slotCount}, ${CELL}px)`,
        gridTemplateColumns: `${LABEL}px repeat(${totalLanes}, ${CELL}px)`,
      }
    : {
        display: 'grid',
        gridTemplateColumns: `${LABEL}px repeat(${slotCount}, ${CELL}px)`,
        gridTemplateRows: `${HEADER}px repeat(${totalLanes}, ${CELL}px)`,
      };

  const nodes: ReactNode[] = [];

  // Time labels every 60 min (= 4 slots)
  for (let slot = 0; slot < slotCount; slot += 4) {
    const pos = `${slot + 2}`;
    nodes.push(
      <div
        key={`t${slot}`}
        style={isMobile
          ? { gridRow: pos, gridColumn: '1', fontSize: '11px', color: '#888', padding: '2px 4px', alignSelf: 'start', whiteSpace: 'nowrap' }
          : { gridColumn: pos, gridRow: '1', fontSize: '11px', color: '#888', padding: '2px 4px', whiteSpace: 'nowrap' }
        }
      >
        {toLabel(rangeStart + slot * 15)}
      </div>
    );
  }

  stages.forEach((info, si) => {
    const base = stageBases[si];

    nodes.push(
      <div
        key={`sl-${info.stage.name}`}
        style={isMobile
          ? { gridColumn: `${base} / ${base + info.totalLanes}`, gridRow: '1', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: '12px', background: '#1e1e1e', overflow: 'hidden', whiteSpace: 'nowrap', borderLeft: '1px solid #333' }
          : { gridRow: `${base} / ${base + info.totalLanes}`, gridColumn: '1', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: '12px', background: '#1e1e1e', overflow: 'hidden', whiteSpace: 'nowrap', borderTop: '1px solid #333', padding: '0 8px' }
        }
      >
        {info.stage.name}
      </div>
    );

    info.stage.acts.forEach(act => {
      const laneInfo = info.laneMap.get(act.id)!;
      const startSlot = Math.round((act.startTime - rangeStart) / 15);
      const endSlot = Math.round((act.endTime - rangeStart) / 15);
      const tStart = `${startSlot + 2}`;
      const tEnd = `${endSlot + 2}`;
      const actPos = `${base + laneInfo.lane}`;
      const bg = INTEREST_BG[interestMap[act.id] ?? 0] ?? INTEREST_BG[0];

      nodes.push(
        <div
          key={act.id}
          title={`${act.name} ${toLabel(act.startTime)}–${toLabel(act.endTime)}`}
          style={isMobile
            ? { gridRow: `${tStart} / ${tEnd}`, gridColumn: actPos, background: bg, border: '1px solid #444', borderRadius: '3px', padding: '2px 4px', fontSize: '11px', overflow: 'hidden', margin: '1px' }
            : { gridColumn: `${tStart} / ${tEnd}`, gridRow: actPos, background: bg, border: '1px solid #444', borderRadius: '3px', padding: '2px 4px', fontSize: '11px', overflow: 'hidden', margin: '1px' }
          }
        >
          <div style={{ fontWeight: 600, lineHeight: 1.2, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{act.name}</div>
          <div style={{ color: '#aaa', fontSize: '10px' }}>{toLabel(act.startTime)}–{toLabel(act.endTime)}</div>
        </div>
      );
    });
  });

  return (
    <div style={{ overflow: 'auto' }}>
      <div style={{ ...gridStyle, border: '1px solid #333', background: '#181818' }}>
        {nodes}
      </div>
    </div>
  );
}
