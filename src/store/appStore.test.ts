import { beforeEach, expect, it, vi } from 'vitest';
import { getDay } from '../content';
import { createInitialState, useAppStore } from './appStore';
import { nextStreak, type StreakState } from './streak';

const now = new Date('2026-10-24T09:00:00');

beforeEach(() => {
  localStorage.clear();
  useAppStore.setState(createInitialState());
});

it('counts one streak day per local calendar day and resets after a gap', () => {
  let s: StreakState = { current: 0, best: 0, lastCompletedDate: null };
  s = nextStreak(s, now);
  s = nextStreak(s, new Date('2026-10-24T23:59:00'));
  expect(s.current).toBe(1);
  s = nextStreak(s, new Date('2026-10-25T00:01:00'));
  expect(s.current).toBe(2);
  s = nextStreak(s, new Date('2026-10-27T08:00:00'));
  expect(s.current).toBe(1);
  expect(s.best).toBe(2);
});

it('finishes a day once and clears the active session', () => {
  const store = useAppStore.getState();
  store.startSession('w01d01', 'full', now);
  store.finishSession('w01d01', { speakingSeconds: 900, selfRating: 4 }, now);
  store.finishSession('w01d01', { speakingSeconds: 900, selfRating: 4 }, now);
  const state = useAppStore.getState();
  expect(state.days.w01d01.status).toBe('done');
  expect(state.streak.current).toBe(1);
  expect(state.activeSession).toBeNull();
});

it('persists the active stage for reload', () => {
  useAppStore.getState().startSession('w01d01', 'full', now);
  useAppStore.getState().completeStage('warmup', 60, now);
  const raw = JSON.parse(localStorage.getItem('bol-app-v1') ?? '{}');
  expect(raw.state.activeSession.stage).toBe('pattern');
});

it('schedules a word when rated', () => {
  useAppStore.getState().rateWord('w_developer', 'good', now);
  expect(useAppStore.getState().srs.w_developer.intervalDays).toBe(1);
});

it('queues unrated words from a short session for the next review', () => {
  const store = useAppStore.getState();
  store.startSession('w01d01', 'short', now);
  store.finishSession('w01d01', { speakingSeconds: 600, selfRating: 3 }, now);

  const state = useAppStore.getState();
  expect(Object.keys(state.srs)).toHaveLength(getDay('w01d01').words.length);
  expect(state.srs.w_developer?.intervalDays).toBe(0);
});

it('survives corrupt persisted storage', async () => {
  localStorage.setItem('bol-app-v1', '{bad json');
  vi.resetModules();
  const mod = await import('./appStore');
  expect(mod.useAppStore.getState().days).toEqual({});
});
