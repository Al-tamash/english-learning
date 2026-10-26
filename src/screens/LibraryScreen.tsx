import { useNavigate } from 'react-router-dom';
import { getAllDays } from '../content';
import { useAppStore } from '../store/appStore';

export function LibraryScreen() {
  const navigate = useNavigate();
  const startSession = useAppStore((state) => state.startSession);
  const days = getAllDays();

  const practice = (dayId: string) => {
    startSession(dayId, 'full');
    navigate('/session');
  };

  return (
    <section className="rounded-3xl border border-line bg-surface p-5 shadow-sm sm:p-6">
      <p className="text-xs font-semibold uppercase tracking-wide text-accent">Week 1</p>
      <h2 className="mt-1 text-2xl font-bold">Library</h2>
      <p className="mt-1 text-sm text-muted">Kisi bhi din ko dobara practice karo.</p>

      <div className="mt-4 rounded-2xl border border-line bg-background p-4">
        <p className="text-sm font-semibold">Week 1 lesson</p>
        <p className="mt-1 text-xs text-muted">
          Poora lesson padho, quiz karo, aur patterns print karo.
        </p>
        <div className="mt-3 flex flex-wrap gap-2">
          <a
            href="/lessons/0001-week-1-introduce-yourself.html"
            className="rounded-lg bg-accent px-3 py-1.5 text-xs font-semibold text-accent-ink"
          >
            Open lesson
          </a>
          <a
            href="/reference/0001-week-1-patterns.html"
            className="rounded-lg border border-line bg-surface px-3 py-1.5 text-xs font-semibold"
          >
            Printable patterns
          </a>
        </div>
      </div>

      <div className="mt-5 space-y-2">
        {days.map((day) => (
          <div
            key={day.id}
            className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-line bg-background p-3"
          >
            <div>
              <p className="text-sm font-semibold">
                Day {day.day} · {day.title}
              </p>
              <p className="text-xs text-muted">
                {day.type === 'review' ? 'Review + benchmark' : day.pattern?.frame}
              </p>
            </div>
            <button
              type="button"
              onClick={() => practice(day.id)}
              className="rounded-lg border border-line bg-surface px-3 py-1.5 text-xs font-semibold"
            >
              Practice
            </button>
          </div>
        ))}
      </div>
    </section>
  );
}
