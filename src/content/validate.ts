import { daySchema } from './schema';
import type { DayContent } from './types';

export function parseDay(input: unknown): DayContent {
  return daySchema.parse(input) as DayContent;
}

export function validateAll(days: unknown[]): { days: DayContent[]; errors: string[] } {
  const parsed: DayContent[] = [];
  const errors: string[] = [];
  const dayIds = new Set<string>();
  const wordIds = new Set<string>();

  days.forEach((input, index) => {
    const result = daySchema.safeParse(input);
    if (!result.success) {
      const details = result.error.issues
        .map((issue) => `${issue.path.join('.') || 'day'}: ${issue.message}`)
        .join('; ');
      errors.push(`day ${index}: ${details}`);
      return;
    }

    const day = result.data as DayContent;
    if (dayIds.has(day.id)) {
      errors.push(`duplicate day id: ${day.id}`);
    } else {
      dayIds.add(day.id);
    }

    for (const word of day.words) {
      if (wordIds.has(word.id)) {
        errors.push(`duplicate word id: ${word.id}`);
      } else {
        wordIds.add(word.id);
      }
    }

    parsed.push(day);
  });

  return { days: parsed, errors };
}
