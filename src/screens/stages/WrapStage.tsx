import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import type { DayContent, QuizItem } from '../../content/types';
import { BENCHMARK_PROMPTS } from '../../content/benchmarks';
import { startRecording, type RecordingHandle } from '../../audio/recorder';
import { putRecording } from '../../audio/recordingStore';
import { useAppStore } from '../../store/appStore';

interface WrapStageProps {
  day: DayContent;
}

function normalize(value: string): string {
  return value.trim().toLowerCase().replace(/\s+/g, ' ');
}

export function WrapStage({ day }: WrapStageProps) {
  const navigate = useNavigate();
  const finishSession = useAppStore((state) => state.finishSession);
  const completeStage = useAppStore((state) => state.completeStage);
  const [quizIndex, setQuizIndex] = useState(0);
  const [quizDone, setQuizDone] = useState(day.quiz.length === 0);
  const [input, setInput] = useState('');
  const [choice, setChoice] = useState<string | null>(null);
  const [checked, setChecked] = useState<boolean | null>(null);
  const [rating, setRating] = useState<number | null>(null);
  const [missionDone, setMissionDone] = useState(false);
  const [showBenchmarks, setShowBenchmarks] = useState(true);
  const [benchmarkRecording, setBenchmarkRecording] = useState<{
    promptId: string;
    handle: RecordingHandle;
  } | null>(null);
  const [savedBenchmarks, setSavedBenchmarks] = useState<string[]>([]);
  const [benchmarkError, setBenchmarkError] = useState('');

  const quiz: QuizItem | undefined = day.quiz[quizIndex];
  const isReview = day.type === 'review';
  const answer = quiz?.type === 'choice' ? (choice ?? '') : input;

  const resetQuiz = () => {
    setInput('');
    setChoice(null);
    setChecked(null);
  };

  const check = () => {
    if (!quiz) {
      return;
    }
    setChecked(normalize(answer) === normalize(quiz.answer));
  };

  const nextQuiz = () => {
    if (checked === null) {
      return;
    }
    if (quizIndex >= day.quiz.length - 1) {
      setQuizDone(true);
      resetQuiz();
      return;
    }
    setQuizIndex((value) => value + 1);
    resetQuiz();
  };

  const recordBenchmark = async (promptId: string) => {
    if (benchmarkRecording) {
      return;
    }
    setBenchmarkError('');
    try {
      const handle = await startRecording({ dayId: day.id, stage: 'wrap', kind: 'benchmark' });
      setBenchmarkRecording({ promptId, handle });
    } catch {
      setBenchmarkError('Mic nahi mila. Benchmark baad me kar sakte ho.');
    }
  };

  const stopBenchmark = async () => {
    if (!benchmarkRecording) {
      return;
    }
    try {
      const saved = await benchmarkRecording.handle.stop();
      await putRecording(saved);
      setSavedBenchmarks((current) => [...current, benchmarkRecording.promptId]);
    } catch {
      setBenchmarkError('Recording save nahi hui. Phir try karo.');
    } finally {
      setBenchmarkRecording(null);
    }
  };

  const skipBenchmarks = () => {
    benchmarkRecording?.handle.cancel();
    setBenchmarkRecording(null);
    setShowBenchmarks(false);
  };

  const finish = () => {
    if (rating === null) {
      return;
    }
    benchmarkRecording?.handle.cancel();
    completeStage('wrap');
    const active = useAppStore.getState().activeSession;
    finishSession(day.id, {
      speakingSeconds: active?.speakingSeconds ?? 0,
      selfRating: rating,
      missionDone: isReview ? missionDone : false,
    });
    navigate('/progress');
  };

  return (
    <section className="space-y-5">
      {!quizDone && quiz && (
        <div className="space-y-5">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-muted">
              Quiz {quizIndex + 1} / {day.quiz.length}
            </p>
            <h3 className="mt-1 text-xl font-semibold">{quiz.prompt}</h3>
          </div>

          {quiz.type === 'choice' ? (
            <div className="grid gap-2 sm:grid-cols-2">
              {(quiz.options ?? []).map((option) => (
                <button
                  key={option}
                  type="button"
                  onClick={() => {
                    setChoice(option);
                    setChecked(null);
                  }}
                  className={`rounded-xl border px-4 py-3 text-left text-sm font-medium ${
                    choice === option ? 'border-accent bg-background' : 'border-line bg-background'
                  }`}
                >
                  {option}
                </button>
              ))}
            </div>
          ) : (
            <input
              type="text"
              value={input}
              onChange={(event) => {
                setInput(event.target.value);
                setChecked(null);
              }}
              aria-label="Quiz answer"
              placeholder="Answer likho"
              className="w-full rounded-xl border border-line bg-background px-4 py-3 text-base outline-none focus:border-accent"
            />
          )}

          <div className="flex flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={check}
              className="rounded-xl border border-line bg-surface px-4 py-2 text-sm font-semibold"
            >
              Check
            </button>
            {checked !== null && (
              <>
                <span
                  className={`text-sm font-semibold ${checked ? 'text-green-700' : 'text-red-700'}`}
                >
                  {checked ? 'Sahi' : 'Phir se'}
                </span>
                <button
                  type="button"
                  onClick={nextQuiz}
                  className="rounded-xl bg-accent px-4 py-2 text-sm font-semibold text-accent-ink"
                >
                  Aage
                </button>
              </>
            )}
          </div>
        </div>
      )}

      {quizDone && isReview && (
        <>
          <div className="space-y-3 rounded-2xl border border-line bg-background p-4">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-muted">
                  Benchmark
                </p>
                <h3 className="text-lg font-semibold">Apni awaaz record karo</h3>
              </div>
              {showBenchmarks && (
                <button
                  type="button"
                  onClick={skipBenchmarks}
                  className="rounded-lg border border-line bg-surface px-3 py-1.5 text-xs font-semibold"
                >
                  Benchmark baad me
                </button>
              )}
            </div>

            {showBenchmarks ? (
              <div className="space-y-2">
                {BENCHMARK_PROMPTS.map((prompt, index) => (
                  <div
                    key={prompt.id}
                    className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-line bg-surface p-3"
                  >
                    <div className="flex min-w-0 items-start gap-2">
                      <span className="text-sm font-semibold text-muted">{index + 1}.</span>
                      <div>
                        <p className="text-sm font-medium">{prompt.en}</p>
                        <p className="text-xs text-muted">{prompt.hi}</p>
                      </div>
                    </div>
                    {benchmarkRecording?.promptId === prompt.id ? (
                      <button
                        type="button"
                        onClick={() => void stopBenchmark()}
                        className="rounded-lg bg-accent px-3 py-1.5 text-xs font-semibold text-accent-ink"
                      >
                        Stop
                      </button>
                    ) : (
                      <button
                        type="button"
                        onClick={() => void recordBenchmark(prompt.id)}
                        disabled={Boolean(benchmarkRecording)}
                        className="rounded-lg border border-line bg-background px-3 py-1.5 text-xs font-semibold disabled:opacity-50"
                      >
                        Record
                      </button>
                    )}
                    {savedBenchmarks.includes(prompt.id) && (
                      <span className="text-xs font-semibold text-green-700">Saved</span>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted">Benchmark baad me kar sakte ho.</p>
            )}

            {benchmarkError && (
              <p className="rounded-xl bg-red-50 p-3 text-sm text-red-700">{benchmarkError}</p>
            )}
          </div>

          {day.mission && (
            <div className="space-y-3 rounded-2xl border border-line bg-background p-4">
              <p className="text-xs font-semibold uppercase tracking-wide text-muted">Mission</p>
              <h3 className="text-lg font-semibold">{day.mission.title_hi}</h3>
              <ol className="list-decimal space-y-1 pl-5 text-sm text-muted">
                {day.mission.steps_hi.map((step) => (
                  <li key={step}>{step}</li>
                ))}
              </ol>
              <label className="flex items-center gap-2 text-sm font-semibold">
                <input
                  type="checkbox"
                  checked={missionDone}
                  onChange={(event) => setMissionDone(event.target.checked)}
                  className="h-4 w-4 accent-current"
                />
                Mission complete
              </label>
            </div>
          )}
        </>
      )}

      {quizDone && (
        <div className="space-y-4 rounded-2xl border border-line bg-background p-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-muted">Aaj ka review</p>
            <h3 className="text-lg font-semibold">Session kaisa laga?</h3>
            <p className="mt-1 text-sm text-muted">1 = mushkil, 5 = bahut aasan</p>
          </div>
          <div className="flex gap-2" role="group" aria-label="Self rating">
            {[1, 2, 3, 4, 5].map((value) => (
              <button
                key={value}
                type="button"
                onClick={() => setRating(value)}
                aria-pressed={rating === value}
                className={`h-10 w-10 rounded-xl border text-sm font-semibold ${
                  rating === value
                    ? 'border-accent bg-accent text-accent-ink'
                    : 'border-line bg-surface'
                }`}
              >
                {value}
              </button>
            ))}
          </div>
          <button
            type="button"
            onClick={finish}
            disabled={rating === null}
            className="rounded-xl bg-accent px-4 py-2 font-semibold text-accent-ink disabled:opacity-50"
          >
            Session khatam
          </button>
        </div>
      )}
    </section>
  );
}
