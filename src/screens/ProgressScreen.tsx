import { getAllDays } from '../content';
import { useAppStore } from '../store/appStore';

const STATUS_LABEL = {
  done: 'Done',
  in_progress: 'In progress',
  not_started: 'Not started',
} as const;

export function ProgressScreen() {
  const days = useAppStore((state) => state.days);
  const srs = useAppStore((state) => state.srs);
  const streak = useAppStore((state) => state.streak);
  const allDays = getAllDays();
  const complete = allDays.filter((day) => days[day.id]?.status === 'done').length;
  const speakingSeconds = Object.values(days).reduce(
    (total, day) => total + day.speakingSeconds,
    0,
  );
  const strongWords = Object.values(srs).filter((card) => card.intervalDays >= 7).length;

  return (
    <div className="space-y-4">
      <section className="rounded-3xl border border-line bg-surface p-6 shadow-sm">
        <p className="text-xs font-semibold uppercase tracking-wide text-accent">Week 1</p>
        <h2 className="mt-1 text-2xl font-bold">Progress</h2>
        <div className="mt-4 grid gap-3 sm:grid-cols-3">
          <div className="rounded-2xl bg-background p-4">
            <p className="text-sm font-semibold">Days complete: {complete}/{allDays.length}</p>
          </div>
          <div className="rounded-2xl bg-background p-4">
            <p className="text-sm font-semibold">
              Speaking time: {Math.round(speakingSeconds / 60)} min
            </p>
          </div>
          <div className="rounded-2xl bg-background p-4">
            <p className="text-sm font-semibold">Words strong: {strongWords}</p>
          </div>
        </div>
        <p className="mt-4 text-sm text-muted">Streak: {streak.current} din · Best: {streak.best} din</p>
      </section>

      <section className="rounded-3xl border border-line bg-surface p-5 shadow-sm">
        <h3 className="text-lg font-semibold">Week 1 days</h3>
        <div className="mt-3 space-y-2">
          {allDays.map((day) => {
            const progress = days[day.id];
            const status = progress?.status ?? 'not_started';
            return (
              <div
                key={day.id}
                className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-line bg-background p-3"
              >
                <div>
                  <p className="text-sm font-semibold">
                    Day {day.day} · {day.title}
                  </p>
                  <p className="text-xs text-muted">
                    {day.type === 'review' ? 'Review + benchmark' : day.pattern?.frame}
                  </p>
                </div>
                <span
                  className={`rounded-full px-2.5 py-1 text-xs font-semibold ${
                    status === 'done'
                      ? 'bg-accent/15 text-accent'
                      : status === 'in_progress'
                        ? 'bg-amber-100 text-amber-800'
                        : 'bg-line/60 text-muted'
                  }`}
                >
                  {STATUS_LABEL[status]}
                </span>
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
}
