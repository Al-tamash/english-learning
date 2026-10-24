export type SrsRating = 'again' | 'hard' | 'good' | 'easy';

export interface SrsCard {
  itemId: string;
  ease: number;
  intervalDays: number;
  dueAt: string;
  reps: number;
  lapses: number;
  lastRating: SrsRating | null;
  updatedAt: string;
}

export const DAY_MS = 86_400_000;
export const MINUTE_MS = 60_000;
export const LADDER = [1, 3, 7, 14, 30, 60] as const;

const MAX_INTERVAL = 60;
const MIN_EASE = 1.3;

function clampInterval(interval: number): number {
  return Math.min(MAX_INTERVAL, Math.max(0, interval));
}

function nextStep(interval: number): number {
  return LADDER.find((step) => step > interval) ?? 60;
}

function dueAfter(now: Date, intervalDays: number): string {
  return new Date(now.getTime() + intervalDays * DAY_MS).toISOString();
}

function withSchedule(
  card: SrsCard,
  rating: SrsRating,
  now: Date,
  intervalDays: number,
  ease: number,
  lapses: number,
): SrsCard {
  const interval = clampInterval(intervalDays);
  return {
    ...card,
    ease: Math.max(MIN_EASE, ease),
    intervalDays: interval,
    dueAt: rating === 'again' ? new Date(now.getTime() + 10 * MINUTE_MS).toISOString() : dueAfter(now, interval),
    reps: card.reps + 1,
    lapses,
    lastRating: rating,
    updatedAt: now.toISOString(),
  };
}

export function createCard(itemId: string, now: Date): SrsCard {
  return {
    itemId,
    ease: 2.5,
    intervalDays: 0,
    dueAt: now.toISOString(),
    reps: 0,
    lapses: 0,
    lastRating: null,
    updatedAt: now.toISOString(),
  };
}

export function schedule(card: SrsCard, rating: SrsRating, now: Date): SrsCard {
  const isNew = card.intervalDays === 0;

  switch (rating) {
    case 'again':
      return withSchedule(card, rating, now, 0, card.ease - 0.2, card.lapses + 1);
    case 'hard':
      return withSchedule(
        card,
        rating,
        now,
        isNew ? 1 : card.intervalDays,
        card.ease - 0.15,
        card.lapses,
      );
    case 'good':
      return withSchedule(
        card,
        rating,
        now,
        isNew ? 1 : nextStep(card.intervalDays),
        card.ease,
        card.lapses,
      );
    case 'easy':
      return withSchedule(
        card,
        rating,
        now,
        isNew ? 3 : nextStep(nextStep(card.intervalDays)),
        card.ease + 0.15,
        card.lapses,
      );
  }
}

export function dueCards(cards: Record<string, SrsCard>, now: Date, limit = 10): SrsCard[] {
  const nowIso = now.toISOString();
  return Object.values(cards)
    .filter((card) => card.dueAt <= nowIso)
    .sort((a, b) => a.dueAt.localeCompare(b.dueAt))
    .slice(0, Math.max(0, limit));
}
