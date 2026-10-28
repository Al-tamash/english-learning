import { useNavigate } from 'react-router-dom';
import { getAuthoredWeeks, getDaysForWeek, getWeekMeta } from '../content';
import { useAppStore } from '../store/appStore';

export function LibraryScreen() {
  const navigate = useNavigate();
  const startSession = useAppStore((state) => state.startSession);
  const weeks = getWeekMeta();
  const weekOne = weeks.find((item) => item.week === 1);
  const laterWeeks = weeks.filter((item) => item.week >= 2);

  const practice = (dayId: string) => {
    startSession(dayId, 'full');
    navigate('/session');
  };

  return (
    <section className="rounded-3xl border border-line bg-surface p-5 shadow-sm sm:p-6">
      <p className="text-xs font-semibold uppercase tracking-wide text-accent">
        All weeks
      </p>
      <h2 className="mt-1 text-2xl font-bold">Library</h2>
      <p className="mt-1 text-sm text-muted">Kisi bhi din ko dobara practice karo.</p>

      {weekOne && (
        <div className="mt-4 rounded-2xl border border-line bg-background p-4">
          <p className="text-sm font-semibold">Week 1 lesson</p>
          <p className="mt-1 text-xs text-muted">
            Poora lesson padho, quiz karo, aur patterns print karo.
          </p>
          <div className="mt-3 flex flex-wrap gap-2">
            <a
              href={weekOne.lessonHref}
              className="rounded-lg bg-accent px-3 py-1.5 text-xs font-semibold text-accent-ink"
            >
              Open lesson
            </a>
            <a
              href={weekOne.referenceHref}
              className="rounded-lg border border-line bg-surface px-3 py-1.5 text-xs font-semibold"
            >
              Printable patterns
            </a>
          </div>
        </div>
      )}

      <div className="mt-4 rounded-2xl border border-line bg-background p-4">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div>
            <p className="text-sm font-semibold">Weeks 2–12 lessons</p>
            <p className="mt-1 text-xs text-muted">
              Ek hafte me ek lesson. Week 1 ka mission hone ke baad agla kholo.
            </p>
          </div>
          <a
            href="/lessons/index.html"
            className="rounded-lg border border-line bg-surface px-3 py-1.5 text-xs font-semibold"
          >
            Browse all weeks
          </a>
        </div>
        <ul className="mt-3 space-y-2">
          {laterWeeks.map((item) => (
            <li
              key={item.week}
              className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-line bg-surface p-2.5"
            >
              <p className="text-xs font-semibold">
                Week {item.week} · {item.title}
              </p>
              <div className="flex flex-wrap gap-2">
                <a
                  href={item.lessonHref}
                  className="rounded-lg bg-accent px-2.5 py-1 text-xs font-semibold text-accent-ink"
                >
                  Week {item.week} lesson
                </a>
                <a
                  href={item.referenceHref}
                  className="rounded-lg border border-line bg-background px-2.5 py-1 text-xs font-semibold"
                >
                  Week {item.week} reference
                </a>
              </div>
            </li>
          ))}
        </ul>
      </div>

      <h3 className="mt-6 text-lg font-semibold">Practice by week</h3>
      {getAuthoredWeeks().map((week) => (
        <div key={week} className="mt-4">
          <p className="text-sm font-semibold">Week {week} practice</p>
          <div className="mt-2 space-y-2">
            {getDaysForWeek(week).map((day) => (
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
                  aria-label={`Practice Day ${day.day} · Week ${day.week}`}
                  className="rounded-lg border border-line bg-surface px-3 py-1.5 text-xs font-semibold"
                >
                  Practice
                </button>
              </div>
            ))}
          </div>
        </div>
      ))}
    </section>
  );
}
