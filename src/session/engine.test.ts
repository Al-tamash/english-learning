import { createSession, advance, stageList } from './engine';

const now = new Date('2026-10-24T09:00:00');

it('uses six stages for a full session and four for a short one', () => {
  expect(stageList('full')).toEqual(['warmup', 'pattern', 'words', 'shadow', 'scenario', 'wrap']);
  expect(stageList('short')).toEqual(['warmup', 'pattern', 'scenario', 'wrap']);
});

it('advances in order and marks the session done after wrap', () => {
  const s = createSession('w01d01', 'full', now);
  expect(s.stage).toBe('warmup');
  const next = advance(s);
  expect(next.stage).toBe('pattern');
  expect(next.stagesCompleted).toEqual(['warmup']);
  expect(advance({ ...next, stage: 'wrap' }).done).toBe(true);
});

it('uses a review path with due words for Day 7', () => {
  expect(stageList('full', 'review')).toEqual(['warmup', 'words', 'wrap']);
  expect(stageList('short', 'review')).toEqual(['warmup', 'words', 'wrap']);
  expect(createSession('w01d07', 'full', now).stage).toBe('warmup');
});
