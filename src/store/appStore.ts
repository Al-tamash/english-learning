import { create } from 'zustand';
import { createJSONStorage, persist, type StateStorage } from 'zustand/middleware';
import type { Stage } from '../content/types';
import { advance, createSession, type SessionMode, type SessionState } from '../session/engine';
import { createCard, schedule, type SrsCard, type SrsRating } from '../srs/srs';
import { nextStreak, type StreakState } from './streak';

export interface DayProgress {
  dayId: string;
  status: 'not_started' | 'in_progress' | 'done';
  stagesCompleted: Stage[];
  speakingSeconds: number;
  selfRating: number | null;
  missionDone: boolean;
  completedAt: string | null;
  updatedAt: string;
}

export interface Settings {
  ttsVoiceUri: string | null;
  ttsRate: number;
  speechCheckEnabled: boolean;
  speechConsent: 'unset' | 'granted' | 'denied';
}

export interface AppData {
  localProfileId: string;
  days: Record<string, DayProgress>;
  srs: Record<string, SrsCard>;
  settings: Settings;
  streak: StreakState;
  activeSession: SessionState | null;
}

export interface AppActions {
  startSession: (dayId: string, mode: SessionMode, now?: Date) => void;
  setStage: (stage: Stage) => void;
  completeStage: (stage: Stage, speakingSeconds?: number, now?: Date) => void;
  finishSession: (
    dayId: string,
    summary: { speakingSeconds: number; selfRating: number; missionDone?: boolean },
    now?: Date,
  ) => void;
  rateWord: (itemId: string, rating: SrsRating, now?: Date) => void;
  updateSettings: (patch: Partial<Settings>) => void;
  resetAll: () => void;
}

export type AppState = AppData & AppActions;

const STAGE_SECONDS: Record<Stage, number> = {
  warmup: 60,
  pattern: 180,
  words: 150,
  shadow: 180,
  scenario: 240,
  wrap: 60,
};

function makeProfileId(): string {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) {
    return crypto.randomUUID();
  }
  return `local-${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

export function createInitialState(): AppData {
  return {
    localProfileId: makeProfileId(),
    days: {},
    srs: {},
    settings: {
      ttsVoiceUri: null,
      ttsRate: 0.85,
      speechCheckEnabled: true,
      speechConsent: 'unset',
    },
    streak: {
      current: 0,
      best: 0,
      lastCompletedDate: null,
    },
    activeSession: null,
  };
}

function blankProgress(dayId: string, now: Date): DayProgress {
  return {
    dayId,
    status: 'in_progress',
    stagesCompleted: [],
    speakingSeconds: 0,
    selfRating: null,
    missionDone: false,
    completedAt: null,
    updatedAt: now.toISOString(),
  };
}

const safeStorage: StateStorage = {
  getItem: (name) => {
    const raw = localStorage.getItem(name);
    if (!raw) {
      return null;
    }
    try {
      JSON.parse(raw);
      return raw;
    } catch {
      localStorage.removeItem(name);
      return null;
    }
  },
  setItem: (name, value) => {
    localStorage.setItem(name, value);
  },
  removeItem: (name) => {
    localStorage.removeItem(name);
  },
};

export const useAppStore = create<AppState>()(
  persist(
    (set, get) => ({
      ...createInitialState(),

      startSession: (dayId, mode, now = new Date()) => {
        set((state) => {
          const existing = state.days[dayId];
          const day =
            existing?.status === 'done'
              ? existing
              : {
                  ...(existing ?? blankProgress(dayId, now)),
                  status: 'in_progress' as const,
                  updatedAt: now.toISOString(),
                };

          return {
            activeSession: createSession(dayId, mode, now),
            days: { ...state.days, [dayId]: day },
          };
        });
      },

      setStage: (stage) => {
        set((state) =>
          state.activeSession
            ? { activeSession: { ...state.activeSession, stage } }
            : {},
        );
      },

      completeStage: (stage, speakingSeconds, now = new Date()) => {
        const session = get().activeSession;
        if (!session || session.stage !== stage) {
          return;
        }

        const next = advance(session);
        const seconds = speakingSeconds ?? STAGE_SECONDS[stage];

        set((state) => {
          const day = state.days[session.dayId] ?? blankProgress(session.dayId, now);
          const stagesCompleted = Array.from(
            new Set([...day.stagesCompleted, ...next.stagesCompleted, stage]),
          );

          return {
            activeSession: {
              ...next,
              speakingSeconds: next.speakingSeconds + seconds,
            },
            days: {
              ...state.days,
              [session.dayId]: {
                ...day,
                status: day.status === 'done' ? 'done' : 'in_progress',
                stagesCompleted,
                speakingSeconds: day.speakingSeconds + seconds,
                updatedAt: now.toISOString(),
              },
            },
          };
        });
      },

      finishSession: (dayId, summary, now = new Date()) => {
        set((state) => {
          const existing = state.days[dayId];

          if (existing?.status === 'done') {
            return state.activeSession?.dayId === dayId ? { activeSession: null } : {};
          }

          const day = existing ?? blankProgress(dayId, now);
          const stagesCompleted = Array.from(
            new Set([...day.stagesCompleted, ...(state.activeSession?.stagesCompleted ?? [])]),
          );

          return {
            activeSession: state.activeSession?.dayId === dayId ? null : state.activeSession,
            days: {
              ...state.days,
              [dayId]: {
                ...day,
                status: 'done',
                stagesCompleted,
                speakingSeconds: day.speakingSeconds + summary.speakingSeconds,
                selfRating: summary.selfRating,
                missionDone: summary.missionDone ?? false,
                completedAt: now.toISOString(),
                updatedAt: now.toISOString(),
              },
            },
            streak: nextStreak(state.streak, now),
          };
        });
      },

      rateWord: (itemId, rating, now = new Date()) => {
        set((state) => {
          const card = state.srs[itemId] ?? createCard(itemId, now);
          return {
            srs: {
              ...state.srs,
              [itemId]: schedule(card, rating, now),
            },
          };
        });
      },

      updateSettings: (patch) => {
        set((state) => ({
          settings: { ...state.settings, ...patch },
        }));
      },

      resetAll: () => {
        set(createInitialState());
        localStorage.removeItem('bol-app-v1');
      },
    }),
    {
      name: 'bol-app-v1',
      version: 1,
      storage: createJSONStorage(() => safeStorage),
    },
  ),
);
