import { useState } from 'react';
import type { DayContent } from '../../content/types';
import { speak } from '../../audio/tts';
import { useAppStore } from '../../store/appStore';

interface PatternStageProps {
  day: DayContent;
}

export function PatternStage({ day }: PatternStageProps) {
  const pattern = day.pattern;
  const completeStage = useAppStore((state) => state.completeStage);
  const [advancing, setAdvancing] = useState(false);

  if (!pattern) {
    return (
      <section className="space-y-4">
        <h3 className="text-xl font-semibold">Pattern</h3>
        <p className="text-muted">Is din pattern nahi hai.</p>
        <button
          type="button"
          onClick={() => completeStage('pattern')}
          className="rounded-xl bg-accent px-4 py-2 font-semibold text-accent-ink"
        >
          Aage badho
        </button>
      </section>
    );
  }

  const next = () => {
    if (advancing) {
      return;
    }
    setAdvancing(true);
    completeStage('pattern');
  };

  return (
    <section className="space-y-5">
      <div>
        <p className="text-xs font-semibold uppercase tracking-wide text-muted">Pattern</p>
        <h3 className="mt-1 text-2xl font-semibold leading-snug">{pattern.frame}</h3>
        <p className="mt-2 text-sm text-muted">{pattern.note_hi}</p>
      </div>

      <div className="grid gap-2 sm:grid-cols-3">
        {(['positive', 'negative', 'question'] as const).map((form) => (
          <div key={form} className="rounded-2xl border border-line bg-background p-3">
            <p className="text-xs font-semibold uppercase tracking-wide text-muted">{form}</p>
            <p className="mt-1 text-sm">{pattern.forms[form]}</p>
          </div>
        ))}
      </div>

      <div className="space-y-2">
        {pattern.examples.map((example) => (
          <div
            key={example.en}
            className="flex items-center justify-between gap-3 rounded-xl border border-line bg-background p-3"
          >
            <div>
              <p className="text-sm font-medium">{example.en}</p>
              <p className="text-xs text-muted">{example.hi}</p>
            </div>
            <button
              type="button"
              onClick={() => void speak(example.en)}
              className="shrink-0 rounded-lg border border-line bg-surface px-3 py-1.5 text-xs font-semibold"
            >
              Suno
            </button>
          </div>
        ))}
      </div>

      <button
        type="button"
        onClick={next}
        disabled={advancing}
        className="rounded-xl bg-accent px-4 py-2 font-semibold text-accent-ink disabled:opacity-60"
      >
        Aage badho
      </button>
    </section>
  );
}
