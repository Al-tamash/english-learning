function getSynthesis(): SpeechSynthesis | undefined {
  return typeof window !== 'undefined' ? window.speechSynthesis : undefined;
}

function getUtteranceCtor(): typeof SpeechSynthesisUtterance | undefined {
  return typeof window !== 'undefined' ? window.SpeechSynthesisUtterance : undefined;
}

export function getEnglishVoices(): SpeechSynthesisVoice[] {
  const voices = getSynthesis()?.getVoices() ?? [];
  return voices.filter((voice) => /^en(-|$)/i.test(voice.lang));
}

export function pickVoice(
  voices: SpeechSynthesisVoice[],
  preferredLang = 'en-IN',
): SpeechSynthesisVoice | null {
  let best: SpeechSynthesisVoice | null = null;
  let bestScore = -Infinity;

  for (const voice of voices) {
    const lang = voice.lang.toLowerCase();
    const name = voice.name.toLowerCase();
    if (!lang.startsWith('en')) {
      continue;
    }

    let score = 0;
    if (lang === preferredLang.toLowerCase()) {
      score += 5;
    } else if (lang === 'en-in') {
      score += 5;
    } else if (lang === 'en-us' || lang === 'en-gb') {
      score += 2;
    }

    if (name.includes('male')) {
      score += 3;
    }
    if (/daniel|alex|rishi|male/.test(name)) {
      score += 2;
    }
    if (name.includes('female')) {
      score -= 3;
    }

    if (score > bestScore) {
      best = voice;
      bestScore = score;
    }
  }

  return best;
}

export function speak(
  text: string,
  opts: { rate?: number; voiceUri?: string | null } = {},
): Promise<void> {
  const synthesis = getSynthesis();
  const Utterance = getUtteranceCtor();
  if (!synthesis || !Utterance) {
    return Promise.resolve();
  }

  synthesis.cancel();
  const utterance = new Utterance(text);
  utterance.rate = opts.rate ?? 0.85;

  const voices = synthesis.getVoices();
  const chosen = opts.voiceUri
    ? voices.find((voice) => voice.voiceURI === opts.voiceUri) ?? pickVoice(voices)
    : pickVoice(voices);
  if (chosen) {
    utterance.voice = chosen;
  }

  return new Promise<void>((resolve) => {
    let settled = false;
    const finish = () => {
      if (settled) {
        return;
      }
      settled = true;
      resolve();
    };

    utterance.onend = finish;
    utterance.onerror = finish;
    try {
      synthesis.speak(utterance);
    } catch {
      finish();
    }
  });
}

export function stopSpeaking(): void {
  getSynthesis()?.cancel();
}
