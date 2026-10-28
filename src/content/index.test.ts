import {
  ALL_DAYS,
  BENCHMARK_PROMPTS,
  WEEK_1_DAYS,
  getAuthoredWeeks,
  getDay,
  getDaysForWeek,
  getNextDay,
  getWeekMeta,
} from './index';

it('loads both authored weeks in order', () => {
  expect(ALL_DAYS).toHaveLength(14);
  expect(WEEK_1_DAYS).toHaveLength(7);
  expect(ALL_DAYS[7].id).toBe('w02d01');
  expect(getDaysForWeek(2).map((d) => d.id)).toEqual([
    'w02d01',
    'w02d02',
    'w02d03',
    'w02d04',
    'w02d05',
    'w02d06',
    'w02d07',
  ]);
  expect(getAuthoredWeeks()).toEqual([1, 2]);
});

it('keeps every learning day at Week 1 depth', () => {
  for (const day of ALL_DAYS.filter((d) => d.type === 'learning')) {
    expect(day.words).toHaveLength(5);
    expect(day.dialogue?.lines).toHaveLength(6);
    expect(day.scenario?.turns).toHaveLength(4);
    expect(day.quiz).toHaveLength(3);
  }
});

it('keeps every Day 7 review-only', () => {
  for (const day of ALL_DAYS.filter((d) => d.day === 7)) {
    expect(day.type).toBe('review');
    expect(day.words).toHaveLength(0);
    expect(day.pattern).toBeNull();
    expect(day.mission).not.toBeNull();
  }
});

it('moves across the week boundary and stops at the last authored day', () => {
  expect(getNextDay('w01d01')?.id).toBe('w01d02');
  expect(getNextDay('w01d07')?.id).toBe('w02d01');
  expect(getNextDay('w02d07')).toBeNull();
});

it('derives lesson and reference links for every week', () => {
  const meta = getWeekMeta();
  expect(meta).toHaveLength(12);
  expect(meta[0]).toMatchObject({
    week: 1,
    lessonHref: '/lessons/0001-week-1-introduce-yourself.html',
    referenceHref: '/reference/0001-week-1-patterns.html',
  });
  expect(meta[1]).toMatchObject({
    week: 2,
    lessonHref: '/lessons/0002-week-2-daily-routine-and-small-talk.html',
    referenceHref: '/reference/0002-week-2-patterns.html',
  });
});

it('defines four benchmark prompts', () => {
  expect(BENCHMARK_PROMPTS).toHaveLength(4);
});

it('throws for an unknown day', () => {
  expect(() => getDay('w99d01')).toThrow('Unknown day: w99d01');
});
