import { useEffect, useRef, type ReactNode } from "react";
import type { Day, Act, InterestLevel, InterestMap } from "../types";
import BandCard from "./BandCard";
import { formatTime } from "../lib/time";
import { formatDayLabel } from "../lib/date";

interface Props {
  day: Day;
  interestMap: InterestMap;
  setInterest: (actId: string, level: InterestLevel) => void;
  seenMap: Record<string, boolean>;
  setSeen: (actId: string) => void;
  selectedLevels: Set<InterestLevel>;
  scrollToMinutes?: number;
}

function getTimeRange(day: Day): { start: number; end: number } {
  let start = Infinity,
    end = 0;
  for (const stage of day.stages) {
    for (const act of stage.acts) {
      if (act.startTime < start) start = act.startTime;
      if (act.endTime > end) end = act.endTime;
    }
  }
  return { start: Math.floor(start / 15) * 15, end: Math.ceil(end / 15) * 15 };
}

function getBreaks(
  acts: Act[],
  minGap = 30,
): Array<{ gapStart: number; gapEnd: number }> {
  if (acts.length < 2) return [];
  const sorted = [...acts].sort((a, b) => a.startTime - b.startTime);
  const result: Array<{ gapStart: number; gapEnd: number }> = [];
  let currentEnd = sorted[0].endTime;
  for (let i = 1; i < sorted.length; i++) {
    if (sorted[i].startTime - currentEnd >= minGap) {
      result.push({ gapStart: currentEnd, gapEnd: sorted[i].startTime });
    }
    currentEnd = Math.max(currentEnd, sorted[i].endTime);
  }
  return result;
}

function assignLanes(
  acts: Act[],
): Map<string, { lane: number; totalLanes: number }> {
  const sorted = [...acts].sort((a, b) => a.startTime - b.startTime);
  const laneEnds: number[] = [];
  const laneOf = new Map<string, number>();

  for (const act of sorted) {
    const free = laneEnds.findIndex((e) => e <= act.startTime);
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
const HEADER = 32;

export default function Timeline({
  day,
  interestMap,
  setInterest,
  seenMap,
  setSeen,
  selectedLevels,
  scrollToMinutes,
}: Props) {
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollToMinutes === undefined || !scrollRef.current) return;
    if (!day.stages.some((s) => s.acts.length > 0)) return;
    const { start: rangeStart } = getTimeRange(day);
    scrollRef.current.scrollLeft = ((scrollToMinutes - rangeStart) / 15) * CELL;
  }, [day, scrollToMinutes]);

  if (!day.stages.some((s) => s.acts.length > 0)) {
    return <p>No lineup for {formatDayLabel(day.date)}.</p>;
  }

  const { start: rangeStart, end: rangeEnd } = getTimeRange(day);
  const slotCount = (rangeEnd - rangeStart) / 15;

  const stages = day.stages
    .map((stage) => ({
      ...stage,
      acts: selectedLevels.size === 0
        ? stage.acts
        : stage.acts.filter((a) => selectedLevels.has((interestMap[a.id] ?? 0) as InterestLevel)),
    }))
    .filter((s) => s.acts.length > 0)
    .map((stage) => {
      const laneMap = assignLanes(stage.acts);
      const totalLanes = Math.max(
        ...[...laneMap.values()].map((v) => v.totalLanes),
      );
      return { stage, laneMap, totalLanes };
    });

  const totalLanes = stages.reduce((n, s) => n + s.totalLanes, 0);

  const stageBases: number[] = [];
  let cursor = 2;
  for (const s of stages) {
    stageBases.push(cursor);
    cursor += s.totalLanes;
  }

  const gridStyle = {
    display: "grid",
    gridTemplateColumns: `repeat(${slotCount}, ${CELL}px)`,
    gridTemplateRows: `${HEADER}px repeat(${totalLanes}, ${CELL * 1.5}px)`,
  };

  const nodes: ReactNode[] = [];

  for (let slot = 0; slot < slotCount; slot += 4) {
    nodes.push(
      <div
        key={`t${slot}`}
        style={{
          gridColumn: `${slot + 1}`,
          gridRow: "1",
          fontSize: "11px",
          color: "#888",
          padding: "2px 4px",
          whiteSpace: "nowrap",
        }}
      >
        {formatTime(rangeStart + slot * 15)}
      </div>,
    );
  }

  stages.forEach((info, si) => {
    const base = stageBases[si];

    info.stage.acts.forEach((act) => {
      const laneInfo = info.laneMap.get(act.id)!;
      const startSlot = Math.round((act.startTime - rangeStart) / 15);
      const endSlot = Math.round((act.endTime - rangeStart) / 15);
      const actPos = `${base + laneInfo.lane}`;
      const level = (interestMap[act.id] ?? 0) as InterestLevel;

      nodes.push(
        <div
          key={act.id}
          style={{
            gridColumn: `${startSlot + 1} / ${endSlot + 1}`,
            gridRow: actPos,
            padding: "1px",
          }}
        >
          <BandCard
            act={act}
            level={level}
            seen={seenMap[act.id] ?? false}
            onToggle={() =>
              setInterest(act.id, ((level + 1) % 4) as InterestLevel)
            }
            onToggleSeen={() => setSeen(act.id)}
          />
        </div>,
      );
    });

    getBreaks(info.stage.acts, 15).forEach(({ gapStart, gapEnd }) => {
      const s = Math.round((gapStart - rangeStart) / 15);
      const e = Math.round((gapEnd - rangeStart) / 15);
      nodes.push(
        <div
          key={`brk-${info.stage.name}-${gapStart}`}
          style={{
            gridColumn: `${s + 1} / ${e + 1}`,
            gridRow: `${base} / ${base + info.totalLanes}`,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: "#444",
            fontSize: "10px",
            fontStyle: "italic",
            pointerEvents: "none",
          }}
        >
          {gapEnd - gapStart} min
        </div>,
      );
    });
  });

  return (
    <div className="timeline-wrap">
      <div className="timeline-labels">
        <div style={{ height: HEADER }} />
        {stages.map((info) => (
          <div
            key={`sl-${info.stage.name}`}
            style={{
              height: CELL * 1.5 * info.totalLanes,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              background: "#1e1e1e",
              overflow: "hidden",
              borderTop: "1px solid #333",
              padding: "0 8px",
              borderRadius: "4px",
            }}
          >
            <span
              style={{
                minWidth: 0,
                overflow: "hidden",
                wordBreak: "break-word",
                textAlign: "center",
                lineHeight: 1.2,
                fontWeight: 700,
                fontSize: "12px",
              }}
            >
              {info.stage.name}
            </span>
          </div>
        ))}
      </div>
      <div className="timeline-scroll" ref={scrollRef}>
        <div style={gridStyle}>
          {nodes}
        </div>
      </div>
    </div>
  );
}
