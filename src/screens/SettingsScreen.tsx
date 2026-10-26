import { useEffect, useState, type ChangeEvent } from 'react';
import { getEnglishVoices } from '../audio/tts';
import { clearAllRecordings, clearOldPracticeRecordings } from '../audio/recordingStore';
import {
  getPersistenceStatus,
  requestPersistence,
  type PersistenceStatus,
} from '../storage/persistence';
import { useAppStore, type AppData } from '../store/appStore';
import { downloadBackup, parseBackup, pickAppData } from '../store/backup';

const STORAGE_LABEL: Record<PersistenceStatus, string> = {
  checking: 'Storage status check ho raha hai...',
  persisted: 'Persistent storage on hai.',
  'best-effort': 'Best effort — browser kabhi storage clear kar sakta hai.',
  unsupported: 'Ye browser persistent storage support nahi karta.',
  error: 'Storage status check nahi hua.',
};

export function SettingsScreen() {
  const settings = useAppStore((state) => state.settings);
  const updateSettings = useAppStore((state) => state.updateSettings);
  const replaceAll = useAppStore((state) => state.replaceAll);
  const resetAll = useAppStore((state) => state.resetAll);
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>(() => getEnglishVoices());
  const [confirming, setConfirming] = useState(false);
  const [resetting, setResetting] = useState(false);
  const [pendingImport, setPendingImport] = useState<AppData | null>(null);
  const [notice, setNotice] = useState('');
  const [storageStatus, setStorageStatus] = useState<PersistenceStatus>('checking');
  const [requestingStorage, setRequestingStorage] = useState(false);

  useEffect(() => {
    void clearOldPracticeRecordings(new Date(), 30);

    const updateVoices = () => setVoices(getEnglishVoices());
    updateVoices();
    const synthesis = typeof window !== 'undefined' ? window.speechSynthesis : undefined;
    synthesis?.addEventListener?.('voiceschanged', updateVoices);
    return () => synthesis?.removeEventListener?.('voiceschanged', updateVoices);
  }, []);

  useEffect(() => {
    let cancelled = false;
    void getPersistenceStatus().then((status) => {
      if (!cancelled) {
        setStorageStatus(status);
      }
    });
    return () => {
      cancelled = true;
    };
  }, []);

  const exportBackup = () => {
    try {
      downloadBackup(pickAppData(useAppStore.getState()));
      setNotice('Backup download ho gaya.');
    } catch {
      setNotice('Backup download nahi hua. Browser storage check karo.');
    }
  };

  const chooseImport = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = '';
    if (!file) {
      return;
    }
    try {
      setPendingImport(parseBackup(await file.text()));
      setNotice('');
    } catch (error) {
      setPendingImport(null);
      setNotice(error instanceof Error ? error.message : 'Backup import nahi hua.');
    }
  };

  const confirmImport = () => {
    if (!pendingImport) {
      return;
    }
    replaceAll(pendingImport);
    setPendingImport(null);
    setNotice('Backup import ho gaya.');
  };

  const requestStorage = async () => {
    setRequestingStorage(true);
    try {
      setStorageStatus(await requestPersistence());
    } finally {
      setRequestingStorage(false);
    }
  };

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
        <p className="mt-1 text-sm text-muted">Awaaz, backup aur storage yahan se control karo.</p>

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

          <div>
            <label className="flex items-center gap-2 text-sm font-semibold">
              <input
                type="checkbox"
                checked={settings.speechCheckEnabled && settings.speechConsent === 'granted'}
                onChange={(event) =>
                  updateSettings(
                    event.target.checked
                      ? { speechCheckEnabled: true, speechConsent: 'granted' }
                      : { speechCheckEnabled: false },
                  )
                }
                className="h-4 w-4 accent-current"
              />
              Voice check
            </label>
            <p className="mt-1 text-xs text-muted">
              {settings.speechConsent === 'granted'
                ? 'Browser mic audio process kar sakta hai. Recording local rehti hai.'
                : 'Off hai. On karne par browser mic processing ki permission milti hai.'}
            </p>
          </div>
        </div>
      </section>

      <section className="rounded-3xl border border-line bg-surface p-5 shadow-sm">
        <h3 className="text-lg font-semibold">Backup & restore</h3>
        <p className="mt-1 text-sm text-muted">
          Progress, SRS aur settings ka JSON backup. Recordings isme include nahi hote.
        </p>
        <div className="mt-3 flex flex-wrap gap-2">
          <button
            type="button"
            onClick={exportBackup}
            className="rounded-xl bg-accent px-4 py-2 text-sm font-semibold text-accent-ink"
          >
            Export JSON
          </button>
          <label className="cursor-pointer rounded-xl border border-line bg-background px-4 py-2 text-sm font-semibold">
            Import JSON
            <input
              type="file"
              accept=".json,application/json"
              aria-label="Import JSON"
              className="sr-only"
              onChange={(event) => void chooseImport(event)}
            />
          </label>
        </div>
        {notice && (
          <p role="status" aria-live="polite" className="mt-3 text-sm text-muted">
            {notice}
          </p>
        )}

        <div className="mt-4 rounded-xl border border-line bg-background p-3">
          <p className="text-sm font-semibold">Browser storage</p>
          <p className="mt-1 text-xs text-muted">{STORAGE_LABEL[storageStatus]}</p>
          {storageStatus !== 'persisted' &&
            storageStatus !== 'unsupported' &&
            storageStatus !== 'checking' && (
              <button
                type="button"
                onClick={() => void requestStorage()}
                disabled={requestingStorage}
                className="mt-2 rounded-xl border border-line bg-surface px-3 py-1.5 text-xs font-semibold disabled:opacity-60"
              >
                {requestingStorage ? 'Request ho raha hai...' : 'Persistent storage request karo'}
              </button>
            )}
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

      {pendingImport && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="import-title"
          className="fixed inset-0 z-20 flex items-center justify-center bg-ink/30 p-4"
        >
          <div className="w-full max-w-sm rounded-2xl border border-line bg-surface p-5 shadow-lg">
            <h3 id="import-title" className="text-lg font-semibold">
              Backup import karein?
            </h3>
            <p className="mt-2 text-sm text-muted">
              Current progress replace ho jayega. Recordings delete nahi honge.
            </p>
            <div className="mt-4 flex gap-2">
              <button
                type="button"
                onClick={confirmImport}
                className="rounded-xl bg-accent px-4 py-2 text-sm font-semibold text-accent-ink"
              >
                Import karo
              </button>
              <button
                type="button"
                onClick={() => setPendingImport(null)}
                className="rounded-xl border border-line bg-background px-4 py-2 text-sm font-semibold"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

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
