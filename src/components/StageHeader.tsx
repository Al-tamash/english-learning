import { useNavigate } from 'react-router-dom';
import type { DayContent, Stage } from '../content/types';
import type { SessionState } from '../session/engine';
import { stageList } from '../session/engine';

const LABELS: Record<Stage, string> = {
  warmup: 'Warm-up',
  pattern: 'Pattern',
  words: 'Words',
  shadow: 'Shadowing',
  scenario: 'Scenario',
  wrap: 'Wrap',
};

interface StageHeaderProps {
  day: DayContent;
  session: SessionState;
}

export function StageHeader({ day, session }: StageHeaderProps) {
  const navigate = useNavigate();
  const stages = stageList(session.mode, day.type);

  return (
    <header className="mb-5 flex flex-wrap items-center justify-between gap-3 border-b border-line pb-4">
      <div>
        <p className="text-xs font-semibold uppercase tracking-wide text-muted">Session</p>
        <h2 className="text-lg font-semibold">
          Day {day.day} · {day.title}
        </h2>
      </div>

      <div className="flex items-center gap-3">
        <div className="flex items-center gap-1.5" aria-label="Stage progress">
          {stages.map((stage) => (
            <span
              key={stage}
              title={LABELS[stage]}
              aria-label={`${LABELS[stage]}${stage === session.stage ? ' (current)' : ''}`}
              className={`h-2.5 w-2.5 rounded-full ${
                session.stagesCompleted.includes(stage)
                  ? 'bg-accent'
                  : stage === session.stage
                    ? 'bg-accent/40 ring-2 ring-accent'
                    : 'bg-line'
              }`}
            />
          ))}
        </div>
        <button
          type="button"
          onClick={() => navigate('/')}
          className="rounded-lg border border-line px-3 py-1.5 text-sm font-medium text-muted hover:text-ink"
        >
          Exit
        </button>
      </div>
    </header>
  );
}
