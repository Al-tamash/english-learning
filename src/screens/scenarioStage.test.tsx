import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, expect, it, vi } from 'vitest';
import { ScenarioStage } from './stages/ScenarioStage';
import { getDay } from '../content';
import { createInitialState, useAppStore } from '../store/appStore';
import { createSession } from '../session/engine';

const mocks = vi.hoisted(() => ({
  startRecording: vi.fn(),
  putRecording: vi.fn(),
  startSpeechCapture: vi.fn(),
  checkKeywords: vi.fn(),
}));

vi.mock('../audio/tts', () => ({ speak: vi.fn().mockResolvedValue(undefined), stopSpeaking: vi.fn() }));
vi.mock('../audio/recorder', () => ({ startRecording: mocks.startRecording }));
vi.mock('../audio/recordingStore', () => ({ putRecording: mocks.putRecording }));
vi.mock('../audio/speechCheck', async (importOriginal) => {
  const actual = await importOriginal<typeof import('../audio/speechCheck')>();
  return {
    ...actual,
    isSpeechCheckSupported: () => true,
    checkKeywords: mocks.checkKeywords,
    startSpeechCapture: mocks.startSpeechCapture,
  };
});

const now = new Date('2026-10-26T09:00:00');

beforeEach(() => {
  mocks.startRecording.mockReset();
  mocks.putRecording.mockReset().mockResolvedValue(undefined);
  mocks.startSpeechCapture.mockReset().mockReturnValue(null);
  mocks.checkKeywords.mockReset().mockResolvedValue({
    transcript: '',
    matched: [],
    total: 3,
    error: null,
  });
});

it('asks for consent, then hides the model answer until an attempt', async () => {
  const session = { ...createSession('w01d01', 'full', now), stage: 'scenario' as const };
  useAppStore.setState({ ...createInitialState(), activeSession: session });

  render(<ScenarioStage day={getDay('w01d01')} />);
  expect(screen.getByText('Voice check on karein?')).toBeInTheDocument();

  const user = userEvent.setup();
  await user.click(screen.getByRole('button', { name: 'Nahi, off rakho' }));
  expect(useAppStore.getState().settings.speechConsent).toBe('denied');
  expect(screen.queryByRole('button', { name: 'Check karo' })).not.toBeInTheDocument();

  await user.click(screen.getByRole('button', { name: 'Bina record kiye aage' }));
  await user.click(screen.getByRole('button', { name: 'Jawab dekho' }));
  expect(screen.getByText(getDay('w01d01').scenario!.turns[0].model_en)).toBeInTheDocument();
});

it('checks the transcript captured during recording, not a second mic session', async () => {
  const state = createInitialState();
  state.settings = { ...state.settings, speechConsent: 'granted', speechCheckEnabled: true };
  state.activeSession = { ...createSession('w01d01', 'full', now), stage: 'scenario' };
  useAppStore.setState(state);

  const saved = {
    id: 'rec-1',
    dayId: 'w01d01',
    stage: 'scenario' as const,
    kind: 'practice' as const,
    createdAt: now.toISOString(),
    durationMs: 1200,
    mimeType: 'audio/webm',
    blob: new Blob(),
  };
  mocks.startRecording.mockResolvedValue({
    stop: vi.fn().mockResolvedValue(saved),
    cancel: vi.fn(),
  });
  mocks.startSpeechCapture.mockReturnValue({
    stop: vi.fn().mockResolvedValue({ transcript: 'I am a web developer', error: null }),
    cancel: vi.fn(),
  });

  const user = userEvent.setup();
  render(<ScenarioStage day={getDay('w01d01')} />);

  await user.click(screen.getByRole('button', { name: 'Record karo' }));
  await user.click(screen.getByRole('button', { name: 'Stop' }));
  await user.click(await screen.findByRole('button', { name: 'Check karo' }));

  expect(await screen.findByText('1/3 key words')).toBeInTheDocument();
  expect(mocks.checkKeywords).not.toHaveBeenCalled();
});

it('explains when no speech was captured instead of showing 0/3', async () => {
  const state = createInitialState();
  state.settings = { ...state.settings, speechConsent: 'granted', speechCheckEnabled: true };
  state.activeSession = { ...createSession('w01d01', 'full', now), stage: 'scenario' };
  useAppStore.setState(state);

  mocks.startRecording.mockResolvedValue({
    stop: vi.fn().mockResolvedValue({
      id: 'rec-1',
      dayId: 'w01d01',
      stage: 'scenario',
      kind: 'practice',
      createdAt: now.toISOString(),
      durationMs: 1200,
      mimeType: 'audio/webm',
      blob: new Blob(),
    }),
    cancel: vi.fn(),
  });
  mocks.startSpeechCapture.mockReturnValue({
    stop: vi.fn().mockResolvedValue({ transcript: '', error: null }),
    cancel: vi.fn(),
  });

  const user = userEvent.setup();
  render(<ScenarioStage day={getDay('w01d01')} />);

  await user.click(screen.getByRole('button', { name: 'Record karo' }));
  await user.click(screen.getByRole('button', { name: 'Stop' }));

  expect(await screen.findByText(/Kuch sunai nahi diya/)).toBeInTheDocument();
  expect(screen.queryByText('0/3 key words')).not.toBeInTheDocument();
});

it('offers a guided second listen when the recording had no transcript', async () => {
  const state = createInitialState();
  state.settings = { ...state.settings, speechConsent: 'granted', speechCheckEnabled: true };
  state.activeSession = { ...createSession('w01d01', 'full', now), stage: 'scenario' };
  useAppStore.setState(state);

  mocks.startRecording.mockResolvedValue({
    stop: vi.fn().mockResolvedValue({
      id: 'rec-1',
      dayId: 'w01d01',
      stage: 'scenario',
      kind: 'practice',
      createdAt: now.toISOString(),
      durationMs: 1200,
      mimeType: 'audio/webm',
      blob: new Blob(),
    }),
    cancel: vi.fn(),
  });
  mocks.startSpeechCapture.mockReturnValue({
    stop: vi.fn().mockResolvedValue({ transcript: '', error: null }),
    cancel: vi.fn(),
  });
  mocks.checkKeywords.mockResolvedValue({
    transcript: 'I build websites',
    matched: ['websites', 'build'],
    total: 3,
    error: null,
  });

  const user = userEvent.setup();
  render(<ScenarioStage day={getDay('w01d01')} />);

  await user.click(screen.getByRole('button', { name: 'Record karo' }));
  await user.click(screen.getByRole('button', { name: 'Stop' }));
  await user.click(await screen.findByRole('button', { name: 'Check karo' }));

  expect(await screen.findByText('2/3 key words')).toBeInTheDocument();
  expect(mocks.checkKeywords).toHaveBeenCalledWith(getDay('w01d01').scenario!.turns[0].keywords);
});
