export interface StreakState {
  current: number;
  best: number;
  lastCompletedDate: string | null;
}

export function localDateKey(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function nextStreak(streak: StreakState, completedAt: Date): StreakState {
  const today = localDateKey(completedAt);
  if (streak.lastCompletedDate === today) {
    return streak;
  }

  const yesterday = new Date(completedAt);
  yesterday.setDate(yesterday.getDate() - 1);
  const previousKey = localDateKey(yesterday);

  const current = streak.lastCompletedDate === previousKey ? streak.current + 1 : 1;
  return {
    current,
    best: Math.max(streak.best, current),
    lastCompletedDate: today,
  };
}
