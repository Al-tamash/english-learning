import { validateAll } from './validate';
import type { DayContent } from './types';

export { BENCHMARK_PROMPTS } from './benchmarks';
export type { BenchmarkPrompt } from './benchmarks';

interface WeekSource {
  number: number;
  slug: string;
  title: string;
}

export interface WeekMeta {
  week: number;
  slug: string;
  title: string;
  lessonHref: string;
  referenceHref: string;
}

const dayModules = import.meta.glob('../../content-src/week-*/w*.json', {
  eager: true,
  import: 'default',
}) as Record<string, unknown>;

const weekModules = import.meta.glob('../../content-src/weeks/week-*.json', {
  eager: true,
  import: 'default',
}) as Record<string, WeekSource>;

const { days, errors } = validateAll(Object.values(dayModules));
if (errors.length > 0) {
  throw new Error(`Invalid content:\n${errors.join('\n')}`);
}

export const ALL_DAYS: DayContent[] = days.sort(
  (a, b) => a.week - b.week || a.day - b.day,
);

export const WEEK_1_DAYS: DayContent[] = ALL_DAYS.filter((day) => day.week === 1);

export function getAllDays(): DayContent[] {
  return [...ALL_DAYS];
}

export function getDay(dayId: string): DayContent {
  const day = ALL_DAYS.find((item) => item.id === dayId);
  if (!day) {
    throw new Error(`Unknown day: ${dayId}`);
  }
  return day;
}

export function getNextDay(dayId: string): DayContent | null {
  const index = ALL_DAYS.findIndex((item) => item.id === dayId);
  if (index < 0) {
    throw new Error(`Unknown day: ${dayId}`);
  }
  return ALL_DAYS[index + 1] ?? null;
}

export function getDaysForWeek(week: number): DayContent[] {
  return ALL_DAYS.filter((day) => day.week === week);
}

export function getAuthoredWeeks(): number[] {
  return [...new Set(ALL_DAYS.map((day) => day.week))].sort((a, b) => a - b);
}

export function getWeekMeta(): WeekMeta[] {
  return Object.values(weekModules)
    .map(({ number, slug, title }) => ({
      week: number,
      slug,
      title,
      lessonHref: `/lessons/${String(number).padStart(4, '0')}-week-${number}-${slug}.html`,
      referenceHref: `/reference/${String(number).padStart(4, '0')}-week-${number}-patterns.html`,
    }))
    .sort((a, b) => a.week - b.week);
}
