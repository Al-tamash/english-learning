import 'fake-indexeddb/auto';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { expect, it, vi } from 'vitest';
import { ShadowStage } from './stages/ShadowStage';
import { getDay } from '../content';
import { createInitialState, useAppStore } from '../store/appStore';
import { createSession } from '../session/engine';
import { startRecording } from '../audio/recorder';

vi.mock('../audio/tts', () => ({ speak: vi.fn().mockResolvedValue(undefined), stopSpeaking: vi.fn() }));
const { stop } = vi.hoisted(() => ({ stop: vi.fn() }));
stop.mockResolvedValue({
  id: 'r1', dayId: 'w01d01', stage: 'shadow', kind: 'practice',
  createdAt: new Date().toISOString(), durationMs: 800, mimeType: 'audio/webm', blob: new Blob(['x']),
});
vi.mock('../audio/recorder', () => ({
  startRecording: vi.fn().mockResolvedValue({ stop, cancel: vi.fn() }),
}));
Object.defineProperty(URL, 'createObjectURL', { configurable: true, value: vi.fn(() => 'blob:test') });
Object.defineProperty(URL, 'revokeObjectURL', { configurable: true, value: vi.fn() });

it('records, stops, and shows playback', async () => {
  const session = { ...createSession('w01d01', 'full', new Date()), stage: 'shadow' as const };
  useAppStore.setState({ ...createInitialState(), activeSession: session });

  render(<ShadowStage day={getDay('w01d01')} />);
  const user = userEvent.setup();
  await user.click(screen.getAllByRole('button', { name: 'Record karo' })[0]);
  await user.click(screen.getByRole('button', { name: 'Stop' }));
  expect(await screen.findByText('Apni recording suno')).toBeInTheDocument();
  expect(stop).toHaveBeenCalled();
});

it('shows a mic error and still allows skipping', async () => {
  vi.mocked(startRecording).mockRejectedValueOnce(new Error('denied'));
  const session = { ...createSession('w01d01', 'full', new Date()), stage: 'shadow' as const };
  useAppStore.setState({ ...createInitialState(), activeSession: session });

  render(<ShadowStage day={getDay('w01d01')} />);
  const user = userEvent.setup();
  await user.click(screen.getAllByRole('button', { name: 'Record karo' })[0]);
  expect(await screen.findByText('Mic nahi mila. Bina recording ke practice karo.')).toBeInTheDocument();
  expect(screen.getByRole('button', { name: 'Aage badho' })).toBeInTheDocument();
});
