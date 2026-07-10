export type InterestLevel = 0 | 1 | 2 | 3;

export interface Act {
  id: string;
  name: string;
  stage: string;
  startTime: number; // minutes since midnight
  endTime: number;   // minutes since midnight
}

export interface Stage {
  name: string;
  acts: Act[];
}

export interface Day {
  date: string; // ISO YYYY-MM-DD
  stages: Stage[];
}

export interface Festival {
  id: string;
  name: string;
  days: Day[];
}

export type InterestMap = Record<string, InterestLevel>;
