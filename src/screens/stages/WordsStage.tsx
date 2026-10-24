import { useEffect, useRef, useState } from 'react';
import { getAllDays } from '../../content';
import type { DayContent, WordItem } from '../../content/types';
import { speak } from '../../audio/tts';
import { useAppStore } from '../../store/appStore';
import { dueCards, type SrsRating } from '../../srs/srs';

interface WordsStageProps {
  day: DayContent;
}

const RATINGS: Array<{ rating: SrsRating; label: string }> = [
  { rating: 'again', label: 'Phir se' },
  { rating: 'hard', label: 'Mushkil' },
  { rating: 'good', label: 'Theek' },
  { rating: 'easy', label: 'Aasan' },
];

const WORD_BY_ID = new Map(
  getAllDays()
    .flatMap((day) => day.words)
    .map((word) => [word.id, word]),
);

export function WordsStage({ day }: WordsStageProps) {
  const rateWord = useAppStore((state) => state.rateWord);
  const completeStage = useAppStore((state) => state.completeStage);
  const [queue] = useState<WordItem[]>(() => {
    const srs = useAppStore.getState().srs;
    const due = dueCards(srs, new Date())
      .map((card) => WORD_BY_ID.get(card.itemId))
      .filter((word): word is WordItem => Boolean(word));
    const fresh = day.words.filter((word) => !srs[word.id]);
    return [...due, ...fresh].filter(
      (word, index, all) => all.findIndex((item) => item.id === word.id) === index,
    );
  });
  const [index, setIndex] = useState(0);
  const [revealed, setRevealed] = useState(false);
  const finished = useRef(false);
  const current = queue[index];

  useEffect(() => {
    if (queue.length === 0 && !finished.current) {
      finished.current = true;
      completeStage('words');
    }
  }, [completeStage, queue.length]);

  const rate = (rating: SrsRating) => {
    if (!current) {
      return;
    }
    rateWord(current.id, rating);
    if (index >= queue.length - 1) {
      completeStage('words');
      return;
    }
    setIndex((value) => value + 1);
    setRevealed(false);
  };

  if (!current) {
    return (
      <section className="space-y-3">
        <h3 className="text-xl font-semibold">Words</h3>
        <p className="text-muted">Aaj naye words nahi</p>
      </section>
    );
  }

  return (
    <section className="space-y-5">
      <div>
        <p className="text-xs font-semibold uppercase tracking-wide text-muted">
          Word {index + 1} / {queue.length}
        </p>
        <h3 className="mt-1 text-xl font-semibold">Word ko yaad karo</h3>
      </div>

      <div className="rounded-2xl border border-line bg-background p-5">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-2xl font-bold text-accent">{current.term}</p>
            <p className="mt-1 text-sm text-muted">{current.collocation}</p>
          </div>
          <button
            type="button"
            onClick={() => void speak(current.example_en)}
            className="shrink-0 rounded-lg border border-line bg-surface px-3 py-1.5 text-xs font-semibold"
          >
            Suno
          </button>
        </div>

        {revealed ? (
          <div className="mt-4 space-y-2 border-t border-line pt-4">
            <p className="text-sm font-medium">{current.hi}</p>
            <p className="text-sm">{current.example_en}</p>
            <p className="text-xs text-muted">{current.example_hi}</p>
          </div>
        ) : (
          <button
            type="button"
            onClick={() => setRevealed(true)}
            className="mt-4 rounded-xl border border-line bg-surface px-4 py-2 text-sm font-semibold"
          >
            Arth dekho
          </button>
        )}
      </div>

      <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
        {RATINGS.map((item) => (
          <button
            key={item.rating}
            type="button"
            onClick={() => rate(item.rating)}
            className="rounded-xl border border-line bg-surface px-3 py-2 text-sm font-semibold hover:border-accent"
          >
            {item.label}
          </button>
        ))}
      </div>
    </section>
  );
}
