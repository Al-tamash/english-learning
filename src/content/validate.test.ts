import { readFileSync } from 'node:fs';
import { parseDay, validateAll } from './validate';

const day1 = JSON.parse(readFileSync('content-src/week-01/w01d01.json', 'utf8'));

it('parses Day 1 with the required counts', () => {
  const day = parseDay(day1);
  expect(day.pattern?.id).toBe('p_work_at');
  expect(day.words).toHaveLength(5);
  expect(day.dialogue?.lines).toHaveLength(6);
  expect(day.scenario?.turns).toHaveLength(4);
  expect(day.quiz).toHaveLength(3);
});

it('rejects a missing pattern frame', () => {
  expect(() => parseDay({ ...day1, pattern: { ...day1.pattern, frame: undefined } })).toThrow();
});

it('reports duplicate day IDs', () => {
  const result = validateAll([day1, { ...day1 }]);
  expect(result.errors.join(' ')).toContain('duplicate day id');
});
