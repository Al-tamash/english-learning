import { useEffect, useState } from 'react';
import { getEnglishVoices } from '../audio/tts';
import { clearAllRecordings, clearOldPracticeRecordings } from '../audio/recordingStore';
import { useAppStore } from '../store/appStore';

export function SettingsScreen() {
  const settings = useAppStore((state) => state.settings);
  const updateSettings = useAppStore((state) => state.updateSettings);
  const resetAll = useAppStore((state) => state.resetAll);
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>(() => getEnglishVoices());
  const [confirming, setConfirming] = useState(false);
  const [resetting, setResetting] = useState(false);

  useEffect(() => {
    void clearOldPracticeRecordings(new Date(), 30);

    const updateVoices = () => setVoices(getEnglishVoices());
    updateVoices();
    const synthesis = typeof window !== 'undefined' ? window.speechSynthesis : undefined;
    synthesis?.addEventListener?.('voiceschanged', updateVoices);
    return () => synthesis?.removeEventListener?.('voiceschanged', updateVoices);
  }, []);

  const reset = async () => {
    if (resetting) {
      return;
    }
    setResetting(true);
    try {
      resetAll();
      await clearAllRecordings();
    } finally {
      setResetting(false);
      setConfirming(false);
    }
  };

  return (
    <div className="space-y-4">
      <section className="rounded-3xl border border-line bg-surface p-5 shadow-sm sm:p-6">
        <h2 className="text-2xl font-bold">Settings</h2>
        <p className="mt-1 text-sm text-muted">Awaaz aur voice check yahan se control karo.</p>

        <div className="mt-5 space-y-4">
          <label className="block">
            <span className="text-sm font-semibold">Voice</span>
            <select
              value={settings.ttsVoiceUri ?? ''}
              onChange={(event) =>
                updateSettings({ ttsVoiceUri: event.target.value || null })
              }
              className="mt-1 w-full rounded-xl border border-line bg-background px-3 py-2 text-sm"
            >
              <option value="">Default voice</option>
              {voices.map((voice) => (
                <option key={voice.voiceURI} value={voice.voiceURI}>
                  {voice.name} ({voice.lang})
                </option>
              ))}
            </select>
            <span className="mt-1 block text-xs text-muted">
              en-IN male voice pehle try kiya jata hai.
            </span>
          </label>

          <label className="block">
            <span className="text-sm font-semibold">Rate: {settings.ttsRate.toFixed(2)}</span>
            <input
              type="range"
              min="0.6"
              max="1.2"
              step="0.05"
              value={settings.ttsRate}
              onChange={(event) => updateSettings({ ttsRate: Number(event.target.value) })}
              className="mt-2 block w-full accent-current"
            />
          </label>

          <label className="flex items-center gap-2 text-sm font-semibold">
            <input
              type="checkbox"
              checked={settings.speechCheckEnabled}
              onChange={(event) =>
                updateSettings({ speechCheckEnabled: event.target.checked })
              }
              className="h-4 w-4 accent-current"
            />
            Voice check
          </label>
        </div>
      </section>

      <section className="rounded-3xl border border-line bg-surface p-5 shadow-sm">
        <h3 className="text-lg font-semibold">Data</h3>
        <p className="mt-1 text-sm text-muted">
          Progress, SRS aur local recordings sab is device se delete ho jayengi.
        </p>
        <button
          type="button"
          onClick={() => setConfirming(true)}
          className="mt-3 rounded-xl border border-red-200 bg-red-50 px-4 py-2 text-sm font-semibold text-red-700"
        >
          Reset data
        </button>
      </section>

      {confirming && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="reset-title"
          className="fixed inset-0 z-20 flex items-center justify-center bg-ink/30 p-4"
        >
          <div className="w-full max-w-sm rounded-2xl border border-line bg-surface p-5 shadow-lg">
            <h3 id="reset-title" className="text-lg font-semibold">
              Sab data delete karein?
            </h3>
            <p className="mt-2 text-sm text-muted">
              Ye wapas nahi aayega. Progress aur recordings dono delete honge.
            </p>
            <div className="mt-4 flex gap-2">
              <button
                type="button"
                onClick={() => void reset()}
                disabled={resetting}
                className="rounded-xl bg-red-600 px-4 py-2 text-sm font-semibold text-white disabled:opacity-60"
              >
                Reset karo
              </button>
              <button
                type="button"
                onClick={() => setConfirming(false)}
                className="rounded-xl border border-line bg-background px-4 py-2 text-sm font-semibold"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
