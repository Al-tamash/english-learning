import { parseDay } from './validate';
import type { DayContent } from './types';
import day1 from '../../content-src/week-01/w01d01.json';
import day2 from '../../content-src/week-01/w01d02.json';
import day3 from '../../content-src/week-01/w01d03.json';
import day4 from '../../content-src/week-01/w01d04.json';
import day5 from '../../content-src/week-01/w01d05.json';
import day6 from '../../content-src/week-01/w01d06.json';
import day7 from '../../content-src/week-01/w01d07.json';

export { BENCHMARK_PROMPTS } from './benchmarks';
export type { BenchmarkPrompt } from './benchmarks';

export const WEEK_1_DAYS: DayContent[] = [day1, day2, day3, day4, day5, day6, day7]
  .map((day) => parseDay(day))
  .sort((a, b) => a.week - b.week || a.day - b.day);

export function getAllDays(): DayContent[] {
  return [...WEEK_1_DAYS];
}

export function getDay(dayId: string): DayContent {
  const day = WEEK_1_DAYS.find((item) => item.id === dayId);
  if (!day) {
    throw new Error(`Unknown day: ${dayId}`);
  }
  return day;
}

export function getNextDay(dayId: string): DayContent | null {
  const index = WEEK_1_DAYS.findIndex((item) => item.id === dayId);
  if (index < 0) {
    throw new Error(`Unknown day: ${dayId}`);
  }
  return WEEK_1_DAYS[index + 1] ?? null;
}
