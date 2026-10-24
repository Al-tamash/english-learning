import { getDay } from '../content';
import type { DayType, Stage } from '../content/types';

export type SessionMode = 'full' | 'short';

export interface SessionState {
  dayId: string;
  mode: SessionMode;
  stage: Stage;
  stagesCompleted: Stage[];
  done: boolean;
  startedAt: string;
  speakingSeconds: number;
}

const FULL_STAGES: Stage[] = ['warmup', 'pattern', 'words', 'shadow', 'scenario', 'wrap'];
const SHORT_STAGES: Stage[] = ['warmup', 'pattern', 'scenario', 'wrap'];
const REVIEW_STAGES: Stage[] = ['warmup', 'words', 'wrap'];

export function stageList(mode: SessionMode, dayType: DayType = 'learning'): Stage[] {
  if (dayType === 'review') {
    return [...REVIEW_STAGES];
  }
  return [...(mode === 'full' ? FULL_STAGES : SHORT_STAGES)];
}

export function createSession(dayId: string, mode: SessionMode, now = new Date()): SessionState {
  const day = getDay(dayId);
  const stages = stageList(mode, day.type);
  return {
    dayId,
    mode,
    stage: stages[0],
    stagesCompleted: [],
    done: false,
    startedAt: now.toISOString(),
    speakingSeconds: 0,
  };
}

function move(state: SessionState, markStage: boolean): SessionState {
  if (state.done) {
    return state;
  }

  const stages = stageList(state.mode, getDay(state.dayId).type);
  const index = stages.indexOf(state.stage);
  const stagesCompleted =
    markStage && !state.stagesCompleted.includes(state.stage)
      ? [...state.stagesCompleted, state.stage]
      : state.stagesCompleted;

  if (index < 0 || index >= stages.length - 1) {
    return { ...state, stage: 'wrap', stagesCompleted, done: true };
  }

  return { ...state, stage: stages[index + 1], stagesCompleted, done: false };
}

export function advance(state: SessionState): SessionState {
  return move(state, true);
}

export function skipStage(state: SessionState): SessionState {
  return move(state, false);
}

export function isFinished(state: SessionState): boolean {
  return state.done;
}
