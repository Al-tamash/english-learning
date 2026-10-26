function normalize(value: string): string {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

export function matchKeywords(transcript: string, keywords: string[]): string[] {
  const normalizedTranscript = normalize(transcript);
  if (!normalizedTranscript) {
    return [];
  }

  const seen = new Set<string>();
  const matched: string[] = [];

  for (const keyword of keywords) {
    const normalizedKeyword = normalize(keyword);
    if (!normalizedKeyword || seen.has(normalizedKeyword)) {
      continue;
    }
    seen.add(normalizedKeyword);
    if (normalizedTranscript.includes(normalizedKeyword)) {
      matched.push(keyword);
    }
  }

  return matched;
}

export function isSpeechCheckSupported(): boolean {
  return (
    typeof window !== 'undefined' &&
    Boolean(window.SpeechRecognition ?? window.webkitSpeechRecognition)
  );
}

export interface SpeechCaptureResult {
  transcript: string;
  error: string | null;
}

export interface SpeechCapture {
  stop(): Promise<SpeechCaptureResult>;
  cancel(): void;
}

export function startSpeechCapture(lang = 'en-IN'): SpeechCapture | null {
  const Recognition =
    typeof window !== 'undefined'
      ? window.SpeechRecognition ?? window.webkitSpeechRecognition
      : undefined;

  if (!Recognition) {
    return null;
  }

  let recognition: SpeechRecognition;
  try {
    recognition = new Recognition();
  } catch {
    return null;
  }
  let finalTranscript = '';
  let interimTranscript = '';
  let error: string | null = null;
  let ended = false;
  let stopResolve: ((result: SpeechCaptureResult) => void) | null = null;
  let stopTimer: ReturnType<typeof setTimeout> | undefined;
  let stopPromise: Promise<SpeechCaptureResult> | null = null;

  const currentTranscript = () =>
    `${finalTranscript} ${interimTranscript}`.replace(/\s+/g, ' ').trim();

  const finishStop = () => {
    if (!stopResolve) {
      return;
    }
    const resolve = stopResolve;
    stopResolve = null;
    if (stopTimer) {
      clearTimeout(stopTimer);
    }
    resolve({ transcript: currentTranscript(), error });
  };

  recognition.lang = lang;
  recognition.continuous = true;
  recognition.interimResults = true;
  recognition.onresult = (event) => {
    for (let index = event.resultIndex; index < event.results.length; index += 1) {
      const result = event.results[index];
      const text = result[0]?.transcript ?? '';
      if (result.isFinal) {
        finalTranscript = `${finalTranscript} ${text}`.trim();
        interimTranscript = '';
      } else {
        interimTranscript = text;
      }
    }
  };
  recognition.onerror = (event) => {
    error = event.error || 'speech-error';
  };
  recognition.onend = () => {
    ended = true;
    finishStop();
  };

  try {
    recognition.start();
  } catch {
    return null;
  }

  return {
    stop: () => {
      if (stopPromise) {
        return stopPromise;
      }
      stopPromise = new Promise<SpeechCaptureResult>((resolve) => {
        if (ended) {
          resolve({ transcript: currentTranscript(), error });
          return;
        }
        stopResolve = resolve;
        try {
          recognition.stop();
        } catch {
          finishStop();
        }
        stopTimer = setTimeout(finishStop, 2000);
      });
      return stopPromise;
    },

    cancel: () => {
      if (stopTimer) {
        clearTimeout(stopTimer);
      }
      const resolve = stopResolve;
      stopResolve = null;
      try {
        recognition.abort();
      } catch {
        // Recognition may already be stopped.
      }
      resolve?.({ transcript: '', error: 'cancelled' });
    },
  };
}

export function checkKeywords(
  keywords: string[],
  timeoutMs = 8000,
): Promise<{ transcript: string; matched: string[]; total: number; error: string | null }> {
  const Recognition =
    typeof window !== 'undefined'
      ? window.SpeechRecognition ?? window.webkitSpeechRecognition
      : undefined;
  const empty = { transcript: '', matched: [], total: keywords.length, error: null };

  if (!Recognition) {
    return Promise.resolve(empty);
  }

  return new Promise((resolve) => {
    let settled = false;
    let error: string | null = null;
    let timer: ReturnType<typeof setTimeout> | undefined;
    const recognition = new Recognition();

    const finish = (transcript = '') => {
      if (settled) {
        return;
      }
      settled = true;
      if (timer) {
        clearTimeout(timer);
      }
      try {
        recognition.stop();
      } catch {
        // Recognition may already be stopped.
      }
      resolve({
        transcript,
        matched: matchKeywords(transcript, keywords),
        total: keywords.length,
        error,
      });
    };

    recognition.lang = 'en-IN';
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.onresult = (event) => {
      finish(event.results[0]?.[0]?.transcript ?? '');
    };
    recognition.onerror = (event) => {
      error = event.error || 'speech-error';
      finish('');
    };
    recognition.onend = () => finish('');

    timer = setTimeout(() => finish(''), timeoutMs);
    try {
      recognition.start();
    } catch {
      finish('');
    }
  });
}
