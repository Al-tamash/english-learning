import { useSaveStatus } from '../store/saveStatus';

export function SaveIndicator() {
  const { state, savedAt } = useSaveStatus();
  const failed = state === 'error';
  const title = failed
    ? 'Browser storage save nahi ho raha. Settings me backup export karo.'
    : savedAt
      ? `Last saved: ${new Date(savedAt).toLocaleTimeString()}`
      : 'Progress is browser me save hota hai.';

  return (
    <span
      className="inline-flex items-center gap-1.5 text-xs text-muted"
      aria-live="polite"
      title={title}
    >
      <span
        aria-hidden="true"
        className={`h-2 w-2 rounded-full ${failed ? 'bg-red-500' : 'bg-emerald-500'}`}
      />
      {failed ? 'Save failed' : 'Saved locally'}
    </span>
  );
}
