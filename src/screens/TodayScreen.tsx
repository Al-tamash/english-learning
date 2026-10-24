import { useNavigate } from 'react-router-dom';
import { getAllDays, getDay } from '../content';
import { useAppStore } from '../store/appStore';

export function TodayScreen() {
  const navigate = useNavigate();
  const days = useAppStore((state) => state.days);
  const activeSession = useAppStore((state) => state.activeSession);
  const streak = useAppStore((state) => state.streak);
  const startSession = useAppStore((state) => state.startSession);

  const nextDay = activeSession
    ? getDay(activeSession.dayId)
    : getAllDays().find((day) => days[day.id]?.status !== 'done');

  if (!nextDay && !activeSession) {
    return (
      <section className="space-y-3 rounded-3xl border border-line bg-surface p-6 shadow-sm">
        <p className="text-xs font-semibold uppercase tracking-wide text-accent">Week {1}</p>
        <h2 className="text-2xl font-bold">Week 1 complete</h2>
        <p className="text-muted">Week 2 jald aa raha hai.</p>
        <p className="text-sm font-medium">Streak: {streak.current} din</p>
      </section>
    );
  }

  const day = nextDay!;
  const completed = getAllDays().filter((item) => days[item.id]?.status === 'done').length;
  const isReview = day.type === 'review';

  const start = (mode: 'full' | 'short') => {
    startSession(day.id, mode);
    navigate('/session');
  };

  return (
    <div className="space-y-4">
      <section className="rounded-3xl border border-line bg-surface p-6 shadow-sm">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-accent">
              {activeSession ? 'Resume' : 'Aaj ka session'}
            </p>
            <h2 className="mt-1 text-2xl font-bold">
              Day {day.day} · Week {day.week}
            </h2>
            <p className="mt-1 text-lg font-medium">{day.title}</p>
            <p className="mt-2 max-w-xl text-sm text-muted">{day.goal_hi}</p>
          </div>
          <div className="rounded-2xl bg-background px-4 py-3 text-right">
            <p className="text-sm font-semibold">Streak: {streak.current} din</p>
          </div>
        </div>

        <div className="mt-5 rounded-2xl border border-line bg-background p-4">
          <p className="text-xs font-semibold uppercase tracking-wide text-muted">
            {isReview ? 'Review' : 'Pattern'}
          </p>
          <p className="mt-1 text-lg font-semibold">
            {day.pattern?.frame ?? 'Aaj review + benchmark'}
          </p>
        </div>

        <div className="mt-5 flex flex-wrap gap-3">
          {activeSession ? (
            <button
              type="button"
              onClick={() => navigate('/session')}
              className="rounded-xl bg-accent px-5 py-2.5 font-semibold text-accent-ink"
            >
              Resume
            </button>
          ) : (
            <>
              <button
                type="button"
                onClick={() => start('full')}
                className="rounded-xl bg-accent px-5 py-2.5 font-semibold text-accent-ink"
              >
                Start 30 min
              </button>
              <button
                type="button"
                onClick={() => start('short')}
                className="rounded-xl border border-line bg-background px-5 py-2.5 font-semibold"
              >
                Short 15 min
              </button>
            </>
          )}
        </div>
      </section>

      <section className="rounded-3xl border border-line bg-surface p-5 shadow-sm">
        <div className="flex items-center justify-between gap-3">
          <p className="text-sm font-semibold">Week {day.week} progress</p>
          <p className="text-sm text-muted">{completed} / {getAllDays().length} din</p>
        </div>
        <div className="mt-3 h-2 overflow-hidden rounded-full bg-background">
          <div
            className="h-full rounded-full bg-accent transition-all"
            style={{ width: `${(completed / getAllDays().length) * 100}%` }}
          />
        </div>
      </section>
    </div>
  );
}
