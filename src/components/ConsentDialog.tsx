interface ConsentDialogProps {
  onGrant: () => void;
  onDeny: () => void;
}

export function ConsentDialog({ onGrant, onDeny }: ConsentDialogProps) {
  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="consent-title"
      className="rounded-2xl border border-accent/30 bg-background p-5"
    >
      <h3 id="consent-title" className="text-lg font-semibold">
        Voice check on karein?
      </h3>
      <p className="mt-2 text-sm text-muted">
        Browser tumhare mic ki audio process kar sakta hai. Recording tumhare device par local rehti hai.
        Tum baad me Settings se ise off kar sakte ho.
      </p>
      <div className="mt-4 flex flex-wrap gap-2">
        <button
          type="button"
          onClick={onGrant}
          className="rounded-xl bg-accent px-4 py-2 text-sm font-semibold text-accent-ink"
        >
          Haan, on karo
        </button>
        <button
          type="button"
          onClick={onDeny}
          className="rounded-xl border border-line bg-surface px-4 py-2 text-sm font-semibold"
        >
          Nahi, off rakho
        </button>
      </div>
    </div>
  );
}
