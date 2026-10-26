import { useNavigate } from 'react-router-dom';
import { getAllDays } from '../content';
import { useAppStore } from '../store/appStore';

const weeklyLessons = [
  { week: 2, title: 'Daily routine and small talk', slug: 'daily-routine-and-small-talk' },
  { week: 3, title: 'Asking and clarifying', slug: 'asking-and-clarifying' },
  { week: 4, title: 'Client kickoff call', slug: 'client-kickoff-call' },
  { week: 5, title: 'Project updates and status', slug: 'project-updates-and-status' },
  { week: 6, title: 'Explain technical work simply', slug: 'explain-technical-work-simply' },
  { week: 7, title: 'Calls and messages', slug: 'calls-and-messages' },
  { week: 8, title: 'In-person meetings', slug: 'in-person-meetings' },
  { week: 9, title: 'Problems, delays, apologies', slug: 'problems-delays-apologies' },
  { week: 10, title: 'Money, quotes, follow-ups', slug: 'money-quotes-follow-ups' },
  { week: 11, title: 'Opinions and suggestions', slug: 'opinions-and-suggestions' },
  { week: 12, title: 'Fluency and real calls', slug: 'fluency-and-real-calls' },
];

const lessonHref = (week: number, slug: string) =>
  `/lessons/${String(week).padStart(4, '0')}-week-${week}-${slug}.html`;

const referenceHref = (week: number) =>
  `/reference/${String(week).padStart(4, '0')}-week-${week}-patterns.html`;

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
          {weeklyLessons.map((item) => (
            <li
              key={item.week}
              className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-line bg-surface p-2.5"
            >
              <p className="text-xs font-semibold">
                Week {item.week} · {item.title}
              </p>
              <div className="flex flex-wrap gap-2">
                <a
                  href={lessonHref(item.week, item.slug)}
                  className="rounded-lg bg-accent px-2.5 py-1 text-xs font-semibold text-accent-ink"
                >
                  Week {item.week} lesson
                </a>
                <a
                  href={referenceHref(item.week)}
                  className="rounded-lg border border-line bg-background px-2.5 py-1 text-xs font-semibold"
                >
                  Week {item.week} reference
                </a>
              </div>
            </li>
          ))}
        </ul>
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
