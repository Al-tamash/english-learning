import { expect, it, vi } from 'vitest';
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
