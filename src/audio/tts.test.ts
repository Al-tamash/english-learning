import { afterEach, expect, it, vi } from 'vitest';
import { createInitialState, useAppStore } from '../store/appStore';
import { pickVoice, speak } from './tts';

const voice = (name: string, lang: string) =>
  ({ name, lang, default: false, localService: true, voiceURI: name }) as SpeechSynthesisVoice;

it('prefers an en-IN voice, then a male English voice', () => {
  const voices = [voice('Google US English', 'en-US'), voice('en-IN-language', 'en-IN')];
  expect(pickVoice(voices)?.lang).toBe('en-IN');

  const male = [voice('Google UK English Female', 'en-GB'), voice('Google UK English Male', 'en-GB')];
  expect(pickVoice(male)?.name).toContain('Male');
  expect(pickVoice([voice('Voix française', 'fr-FR')])).toBeNull();
});

it('resolves even when speech synthesis is missing', async () => {
  vi.stubGlobal('speechSynthesis', undefined);
  await expect(speak('Hello')).resolves.toBeUndefined();
});

afterEach(() => {
  vi.unstubAllGlobals();
  useAppStore.setState(createInitialState());
});

it('uses the saved voice and rate from Settings', async () => {
  const selected = voice('Google UK English Male', 'en-GB');

  class FakeUtterance {
    text: string;
    rate = 1;
    voice: SpeechSynthesisVoice | null = null;
    onend: (() => void) | null = null;
    onerror: (() => void) | null = null;

    constructor(text: string) {
      this.text = text;
    }
  }

  const captured: { utterance?: FakeUtterance } = {};
  vi.stubGlobal('SpeechSynthesisUtterance', FakeUtterance);
  vi.stubGlobal('speechSynthesis', {
    cancel: vi.fn(),
    getVoices: () => [selected],
    speak: (utterance: FakeUtterance) => {
      captured.utterance = utterance;
      utterance.onend?.();
    },
  });

  const state = createInitialState();
  state.settings = {
    ...state.settings,
    ttsRate: 1.1,
    ttsVoiceUri: selected.voiceURI,
  };
  useAppStore.setState(state);

  await speak('Hello');

  expect(captured.utterance?.rate).toBe(1.1);
  expect(captured.utterance?.voice?.voiceURI).toBe(selected.voiceURI);
});
