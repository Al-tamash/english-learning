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

export function checkKeywords(
  keywords: string[],
  timeoutMs = 8000,
): Promise<{ transcript: string; matched: string[]; total: number }> {
  const Recognition =
    typeof window !== 'undefined'
      ? window.SpeechRecognition ?? window.webkitSpeechRecognition
      : undefined;
  const empty = { transcript: '', matched: [], total: keywords.length };

  if (!Recognition) {
    return Promise.resolve(empty);
  }

  return new Promise((resolve) => {
    let settled = false;
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
      });
    };

    recognition.lang = 'en-IN';
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.onresult = (event) => {
      finish(event.results[0]?.[0]?.transcript ?? '');
    };
    recognition.onerror = () => finish('');
    recognition.onend = () => finish('');

    timer = setTimeout(() => finish(''), timeoutMs);
    try {
      recognition.start();
    } catch {
      finish('');
    }
  });
}
