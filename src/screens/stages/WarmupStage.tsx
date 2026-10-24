import { useState } from 'react';
import type { DayContent } from '../../content/types';
import { useAppStore } from '../../store/appStore';
import { getWarmupItems } from '../../session/warmup';

interface WarmupStageProps {
  day: DayContent;
  previousDay: DayContent | null;
}

export function WarmupStage({ day, previousDay }: WarmupStageProps) {
  const items = getWarmupItems(day, previousDay);
  const completeStage = useAppStore((state) => state.completeStage);
  const [index, setIndex] = useState(0);
  const [revealed, setRevealed] = useState(false);
  const item = items[index];

  const answer = () => {
    if (index >= items.length - 1) {
      completeStage('warmup');
      return;
    }
    setIndex((value) => value + 1);
    setRevealed(false);
  };

  if (!item) {
    return (
      <section className="space-y-4">
        <h3 className="text-xl font-semibold">Warm-up</h3>
        <p className="text-muted">Aaj ke liye warm-up ready hai.</p>
        <button
          type="button"
          onClick={() => completeStage('warmup')}
          className="rounded-xl bg-accent px-4 py-2 font-semibold text-accent-ink"
        >
          Aage badho
        </button>
      </section>
    );
  }

  return (
    <section className="space-y-5">
      <div>
        <p className="text-xs font-semibold uppercase tracking-wide text-muted">
          Warm-up {index + 1} / {items.length}
        </p>
        <h3 className="mt-1 text-xl font-semibold">Pehle bolo, phir dekho</h3>
      </div>

      <div className="rounded-2xl border border-line bg-background p-5">
        <p className="text-lg">{item.prompt_hi}</p>
        {revealed ? (
          <p className="mt-3 rounded-xl bg-surface p-3 font-medium text-accent">{item.answer_en}</p>
        ) : (
          <button
            type="button"
            onClick={() => setRevealed(true)}
            className="mt-4 rounded-xl border border-line bg-surface px-4 py-2 text-sm font-semibold"
          >
            Jawab dekho
          </button>
        )}
      </div>

      {revealed && (
        <div className="flex gap-3">
          <button
            type="button"
            onClick={answer}
            className="rounded-xl bg-accent px-4 py-2 font-semibold text-accent-ink"
          >
            Aaya
          </button>
          <button
            type="button"
            onClick={answer}
            className="rounded-xl border border-line bg-surface px-4 py-2 font-semibold"
          >
            Nahi aaya
          </button>
        </div>
      )}
    </section>
  );
}
