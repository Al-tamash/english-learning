import { BENCHMARK_PROMPTS, WEEK_1_DAYS, getDay, getNextDay } from './index';

it('loads all 7 Week 1 days', () => {
  expect(WEEK_1_DAYS).toHaveLength(7);
  expect(getDay('w01d07').type).toBe('review');
});

it('gives every learning day the required counts', () => {
  for (const day of WEEK_1_DAYS.filter((d) => d.type === 'learning')) {
    expect(day.words).toHaveLength(5);
    expect(day.dialogue?.lines).toHaveLength(6);
    expect(day.scenario?.turns).toHaveLength(4);
    expect(day.quiz).toHaveLength(3);
  }
});

it('keeps Day 7 review-only', () => {
  const day = getDay('w01d07');
  expect(day.words).toHaveLength(0);
  expect(day.pattern).toBeNull();
  expect(day.dialogue).toBeNull();
  expect(day.scenario).toBeNull();
  expect(day.mission).not.toBeNull();
});

it('moves to the next day and stops at the end', () => {
  expect(getNextDay('w01d01')?.id).toBe('w01d02');
  expect(getNextDay('w01d07')).toBeNull();
});

it('defines four benchmark prompts', () => {
  expect(BENCHMARK_PROMPTS).toHaveLength(4);
});
