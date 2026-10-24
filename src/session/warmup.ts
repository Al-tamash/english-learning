import type { DayContent } from '../content/types';

export interface WarmupItem {
  prompt_hi: string;
  answer_en: string;
}

export function getWarmupItems(day: DayContent, previousDay: DayContent | null): WarmupItem[] {
  const items: WarmupItem[] = [];
  const seenAnswers = new Set<string>();

  const add = (item: WarmupItem) => {
    if (items.length >= 5 || seenAnswers.has(item.answer_en)) {
      return;
    }
    seenAnswers.add(item.answer_en);
    items.push(item);
  };

  if (previousDay) {
    for (const quiz of previousDay.quiz) {
      add({ prompt_hi: quiz.prompt, answer_en: quiz.answer });
    }

    for (const example of previousDay.pattern?.examples ?? []) {
      add({ prompt_hi: example.hi, answer_en: example.en });
    }
  }

  for (const example of day.pattern?.examples ?? []) {
    add({ prompt_hi: example.hi, answer_en: example.en });
  }

  for (const word of day.words) {
    add({ prompt_hi: word.example_hi, answer_en: word.example_en });
  }

  return items;
}
