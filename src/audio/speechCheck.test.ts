import { afterEach, expect, it, vi } from 'vitest';
import { matchKeywords, startSpeechCapture } from './speechCheck';

const originalSpeech = window.SpeechRecognition;
const originalWebkitSpeech = window.webkitSpeechRecognition;

afterEach(() => {
  window.SpeechRecognition = originalSpeech;
  window.webkitSpeechRecognition = originalWebkitSpeech;
});

class FakeRecognition {
  static latest: FakeRecognition;

  lang = '';
  continuous = false;
  interimResults = false;
  onresult: ((event: SpeechRecognitionEvent) => void) | null = null;
  onerror: ((event: SpeechRecognitionErrorEvent) => void) | null = null;
  onend: (() => void) | null = null;
  start = vi.fn();
  stop = vi.fn(() => this.onend?.());
  abort = vi.fn(() => this.onend?.());

  constructor() {
    FakeRecognition.latest = this;
  }
}

function useFakeRecognition() {
  window.SpeechRecognition = FakeRecognition as unknown as SpeechRecognitionConstructor;
  window.webkitSpeechRecognition = undefined;
}

it('captures the transcript from the recording session', async () => {
  useFakeRecognition();
  const capture = startSpeechCapture();
  expect(capture).not.toBeNull();

  const result = Object.assign([{ transcript: 'I build websites' }], { isFinal: true });
  FakeRecognition.latest.onresult?.({
    resultIndex: 0,
    results: [result],
  } as unknown as SpeechRecognitionEvent);

  await expect(capture!.stop()).resolves.toEqual({
    transcript: 'I build websites',
    error: null,
  });
});

it('reports a speech recognition error instead of silently returning zero matches', async () => {
  useFakeRecognition();
  const capture = startSpeechCapture();

  FakeRecognition.latest.onerror?.({
    error: 'not-allowed',
    message: 'Permission denied',
  } as SpeechRecognitionErrorEvent);

  await expect(capture!.stop()).resolves.toEqual({
    transcript: '',
    error: 'not-allowed',
  });
});

it('returns null when speech recognition is not supported', () => {
  window.SpeechRecognition = undefined;
  window.webkitSpeechRecognition = undefined;
  expect(startSpeechCapture()).toBeNull();
});

it('matches keywords despite case and punctuation', () => {
  expect(matchKeywords("I'm a WEB developer!", ['web', 'developer'])).toEqual(['web', 'developer']);
});

it('matches a plural form of a keyword', () => {
  expect(matchKeywords('I build websites', ['website'])).toEqual(['website']);
});

it('does not invent matches', () => {
  expect(matchKeywords('I work at Edone', ['worked', 'client'])).toEqual([]);
  expect(matchKeywords('', ['web'])).toEqual([]);
});
