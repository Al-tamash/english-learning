import { useState } from 'react';
import type { DayContent } from '../../content/types';
import { startRecording, type RecordingHandle } from '../../audio/recorder';
import { putRecording } from '../../audio/recordingStore';
import { checkKeywords, isSpeechCheckSupported } from '../../audio/speechCheck';
import { useAppStore } from '../../store/appStore';
import { ConsentDialog } from '../../components/ConsentDialog';

interface ScenarioStageProps {
  day: DayContent;
}

const MIC_ERROR = 'Mic nahi mila. Bina recording ke practice karo.';

export function ScenarioStage({ day }: ScenarioStageProps) {
  const scenario = day.scenario;
  const completeStage = useAppStore((state) => state.completeStage);
  const updateSettings = useAppStore((state) => state.updateSettings);
  const consent = useAppStore((state) => state.settings.speechConsent);
  const speechCheckEnabled = useAppStore((state) => state.settings.speechCheckEnabled);
  const [turnIndex, setTurnIndex] = useState(0);
  const [recording, setRecording] = useState<RecordingHandle | null>(null);
  const [attempted, setAttempted] = useState(false);
  const [recorded, setRecorded] = useState(false);
  const [revealed, setRevealed] = useState(false);
  const [checking, setChecking] = useState(false);
  const [result, setResult] = useState<{ matched: number; total: number } | null>(null);
  const [error, setError] = useState('');

  if (!scenario) {
    return (
      <section className="space-y-4">
        <h3 className="text-xl font-semibold">Scenario</h3>
        <p className="text-muted">Is din scenario nahi hai.</p>
        <button
          type="button"
          onClick={() => completeStage('scenario')}
          className="rounded-xl bg-accent px-4 py-2 font-semibold text-accent-ink"
        >
          Aage badho
        </button>
      </section>
    );
  }

  const turn = scenario.turns[turnIndex];
  const supported = isSpeechCheckSupported();
  const canCheck = consent === 'granted' && speechCheckEnabled && supported;

  const start = async () => {
    if (recording) {
      return;
    }
    setError('');
    setResult(null);
    try {
      const handle = await startRecording({ dayId: day.id, stage: 'scenario', kind: 'practice' });
      setRecording(handle);
    } catch {
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
      setAttempted(true);
      setRecorded(true);
    } catch {
      setError(MIC_ERROR);
    } finally {
      setRecording(null);
    }
  };

  const skip = () => {
    recording?.cancel();
    setRecording(null);
    setAttempted(true);
    setRecorded(false);
    setResult(null);
    setError('');
  };

  const check = async () => {
    if (!canCheck || !attempted || checking) {
      return;
    }
    setChecking(true);
    const response = await checkKeywords(turn.keywords);
    setResult({ matched: response.matched.length, total: response.total });
    setChecking(false);
  };

  const next = () => {
    recording?.cancel();
    if (turnIndex >= scenario.turns.length - 1) {
      completeStage('scenario');
      return;
    }
    setTurnIndex((value) => value + 1);
    setAttempted(false);
    setRecorded(false);
    setRevealed(false);
    setResult(null);
    setError('');
  };

  return (
    <section className="space-y-5">
      {consent === 'unset' && supported && (
        <ConsentDialog
          onGrant={() => updateSettings({ speechConsent: 'granted' })}
          onDeny={() => updateSettings({ speechConsent: 'denied' })}
        />
      )}

      <div>
        <p className="text-xs font-semibold uppercase tracking-wide text-muted">
          Scenario · Turn {turnIndex + 1} / {scenario.turns.length}
        </p>
        <h3 className="mt-1 text-xl font-semibold">{scenario.title_hi}</h3>
        <p className="mt-1 text-sm text-muted">{scenario.setting_hi}</p>
      </div>

      <div className="rounded-2xl border border-line bg-background p-5">
        <p className="text-lg font-medium">{turn.prompt_en}</p>
        <p className="mt-2 text-sm text-muted">{turn.hint_hi}</p>
        <div className="mt-3 flex flex-wrap gap-2">
          {turn.keywords.map((keyword) => (
            <span key={keyword} className="rounded-full bg-surface px-2.5 py-1 text-xs">
              {keyword}
            </span>
          ))}
        </div>
      </div>

      <div className="flex flex-wrap gap-2">
        {recording ? (
          <button
            type="button"
            onClick={() => void stop()}
            className="rounded-xl bg-accent px-4 py-2 text-sm font-semibold text-accent-ink"
          >
            Stop
          </button>
        ) : (
          <button
            type="button"
            onClick={() => void start()}
            className="rounded-xl border border-line bg-surface px-4 py-2 text-sm font-semibold"
          >
            Record karo
          </button>
        )}
        <button
          type="button"
          onClick={skip}
          className="rounded-xl border border-line bg-surface px-4 py-2 text-sm font-semibold"
        >
          Bina record kiye aage
        </button>
        {canCheck && recorded && (
          <button
            type="button"
            onClick={() => void check()}
            disabled={checking}
            className="rounded-xl border border-accent px-4 py-2 text-sm font-semibold text-accent disabled:opacity-60"
          >
            Check karo
          </button>
        )}
        <button
          type="button"
          onClick={() => setRevealed(true)}
          disabled={!attempted}
          className="rounded-xl border border-line bg-surface px-4 py-2 text-sm font-semibold disabled:opacity-50"
        >
          Jawab dekho
        </button>
      </div>

      {result && (
        <p className="rounded-xl bg-background p-3 text-sm font-medium">
          {result.matched}/{result.total} key words
        </p>
      )}

      {error && <p className="rounded-xl bg-red-50 p-3 text-sm text-red-700">{error}</p>}

      {revealed && (
        <div className="rounded-2xl border border-line bg-background p-5">
          <p className="text-xs font-semibold uppercase tracking-wide text-muted">Model answer</p>
          <p className="mt-2 text-lg">{turn.model_en}</p>
          <button
            type="button"
            onClick={next}
            className="mt-4 rounded-xl bg-accent px-4 py-2 text-sm font-semibold text-accent-ink"
          >
            Aage
          </button>
        </div>
      )}
    </section>
  );
}
