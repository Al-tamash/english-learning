import { useState } from 'react';
import type { DayContent } from '../../content/types';
import { speak } from '../../audio/tts';
import { startRecording, type RecordingHandle } from '../../audio/recorder';
import { putRecording } from '../../audio/recordingStore';
import { useAppStore } from '../../store/appStore';

interface ShadowStageProps {
  day: DayContent;
}

const MIC_ERROR = 'Mic nahi mila. Bina recording ke practice karo.';

export function ShadowStage({ day }: ShadowStageProps) {
  const dialogue = day.dialogue;
  const completeStage = useAppStore((state) => state.completeStage);
  const [activeLine, setActiveLine] = useState<number | null>(null);
  const [recording, setRecording] = useState<RecordingHandle | null>(null);
  const [playbackUrl, setPlaybackUrl] = useState<string | null>(null);
  const [error, setError] = useState('');

  if (!dialogue) {
    return (
      <section className="space-y-4">
        <h3 className="text-xl font-semibold">Shadowing</h3>
        <p className="text-muted">Is din dialogue nahi hai.</p>
        <button
          type="button"
          onClick={() => completeStage('shadow')}
          className="rounded-xl bg-accent px-4 py-2 font-semibold text-accent-ink"
        >
          Aage badho
        </button>
      </section>
    );
  }

  const record = async (index: number) => {
    if (recording) {
      return;
    }
    setError('');
    setActiveLine(index);
    try {
      const handle = await startRecording({ dayId: day.id, stage: 'shadow', kind: 'practice' });
      setRecording(handle);
    } catch {
      setActiveLine(null);
      setError(MIC_ERROR);
    }
  };

  const stop = async () => {
    if (!recording) {
      return;
    }
    try {
      const saved = await recording.stop();
      await putRecording(saved);
      setPlaybackUrl(URL.createObjectURL(saved.blob));
    } catch {
      setError(MIC_ERROR);
    } finally {
      setRecording(null);
    }
  };

  const next = () => {
    recording?.cancel();
    completeStage('shadow');
  };

  return (
    <section className="space-y-5">
      <div>
        <p className="text-xs font-semibold uppercase tracking-wide text-muted">Shadowing</p>
        <h3 className="mt-1 text-xl font-semibold">{dialogue.title}</h3>
        <p className="mt-1 text-sm text-muted">{dialogue.context_hi}</p>
      </div>

      <div className="rounded-2xl border border-line bg-background p-4">
        <p className="text-sm font-semibold">Sound focus</p>
        <p className="mt-1 text-sm text-muted">{dialogue.sound_focus.tip_hi}</p>
        <div className="mt-2 flex flex-wrap gap-2">
          {dialogue.sound_focus.pairs.map((pair) => (
            <span key={pair} className="rounded-full bg-surface px-2.5 py-1 text-xs">
              {pair}
            </span>
          ))}
        </div>
      </div>

      <div className="space-y-2">
        {dialogue.lines.map((line, index) => (
          <div
            key={`${line.speaker}-${index}`}
            className={`rounded-xl border p-3 ${
              activeLine === index ? 'border-accent bg-background' : 'border-line bg-background'
            }`}
          >
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-muted">
                  Speaker {line.speaker}
                </p>
                <p className="mt-1 text-sm font-medium">{line.en}</p>
                <p className="text-xs text-muted">{line.hi}</p>
              </div>
              <button
                type="button"
                onClick={() => void speak(line.en)}
                className="shrink-0 rounded-lg border border-line bg-surface px-3 py-1.5 text-xs font-semibold"
              >
                Suno
              </button>
            </div>

            <div className="mt-3">
              {recording && activeLine === index ? (
                <button
                  type="button"
                  onClick={() => void stop()}
                  className="rounded-lg bg-accent px-3 py-1.5 text-xs font-semibold text-accent-ink"
                >
                  Stop
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => void record(index)}
                  disabled={Boolean(recording)}
                  className="rounded-lg border border-line bg-surface px-3 py-1.5 text-xs font-semibold disabled:opacity-50"
                >
                  Record karo
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      {error && <p className="rounded-xl bg-red-50 p-3 text-sm text-red-700">{error}</p>}

      {playbackUrl && (
        <div className="rounded-2xl border border-line bg-background p-4">
          <p className="text-sm font-semibold">Apni recording suno</p>
          <audio controls src={playbackUrl} className="mt-2 w-full" />
        </div>
      )}

      <button
        type="button"
        onClick={next}
        className="rounded-xl bg-accent px-4 py-2 font-semibold text-accent-ink"
      >
        Aage badho
      </button>
    </section>
  );
}
