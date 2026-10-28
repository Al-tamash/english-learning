import { describe, expect, it } from 'vitest';
import { parseDay } from './validate';
import d01 from '../../content-src/week-02/w02d01.json';
import d02 from '../../content-src/week-02/w02d02.json';
import d03 from '../../content-src/week-02/w02d03.json';
import d04 from '../../content-src/week-02/w02d04.json';
import d05 from '../../content-src/week-02/w02d05.json';
import d06 from '../../content-src/week-02/w02d06.json';

const days = [d01, d02, d03].map((day) => parseDay(day));
const allLearningDays = [d01, d02, d03, d04, d05, d06].map((day) => parseDay(day));

describe('Week 2 days 1–3', () => {
  it('has the expected ids, days and pattern frames', () => {
    expect(days.map((d) => d.id)).toEqual(['w02d01', 'w02d02', 'w02d03']);
    expect(days.map((d) => d.day)).toEqual([1, 2, 3]);
    expect(days.map((d) => d.week)).toEqual([2, 2, 2]);
    expect(days.map((d) => d.pattern?.frame)).toEqual([
      'I usually ___ at ___.',
      "I don't ___ very often.",
      'How was your weekend?',
    ]);
  });

  it('has Week 1 depth on every day', () => {
    for (const day of days) {
      expect(day.words).toHaveLength(5);
      expect(day.dialogue?.lines).toHaveLength(6);
      expect(day.scenario?.turns).toHaveLength(4);
      expect(day.quiz).toHaveLength(3);
      expect(day.pattern?.examples.length).toBeGreaterThanOrEqual(4);
    }
  });

  it('starts each day with the planned words and scenario', () => {
    expect(days[0].words.map((w) => w.term)).toEqual([
      'routine',
      'commute',
      'alarm',
      'breakfast',
      'schedule',
    ]);
    expect(days.map((d) => d.scenario?.id)).toEqual([
      's_w02_monday_chat',
      's_w02_lunch_colleague',
      's_w02_weekend_plans',
    ]);
  });
});

it('has six learning days with 30 unique words', () => {
  expect(allLearningDays.map((d) => d.id)).toEqual([
    'w02d01',
    'w02d02',
    'w02d03',
    'w02d04',
    'w02d05',
    'w02d06',
  ]);
  const terms = allLearningDays.flatMap((d) => d.words.map((w) => w.term));
  const ids = allLearningDays.flatMap((d) => d.words.map((w) => w.id));
  expect(terms).toHaveLength(30);
  expect(new Set(terms).size).toBe(30);
  expect(new Set(ids).size).toBe(30);
});

it('keeps the last three patterns in weekly order', () => {
  expect(allLearningDays.map((d) => d.pattern?.frame)).toEqual([
    'I usually ___ at ___.',
    "I don't ___ very often.",
    'How was your weekend?',
    'I went to ___ / I stayed ___.',
    'Do you like ___?',
    'What about you?',
  ]);
});
