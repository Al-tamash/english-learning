import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { expect, it, vi } from 'vitest';
import { ScenarioStage } from './stages/ScenarioStage';
import { getDay } from '../content';
import { createInitialState, useAppStore } from '../store/appStore';
import { createSession } from '../session/engine';

vi.mock('../audio/tts', () => ({ speak: vi.fn().mockResolvedValue(undefined), stopSpeaking: vi.fn() }));
vi.mock('../audio/speechCheck', () => ({
  isSpeechCheckSupported: () => true,
  checkKeywords: vi.fn().mockResolvedValue({ transcript: 'I am a web developer', matched: ['web', 'developer'], total: 4 }),
}));

it('asks for consent, then hides the model answer until an attempt', async () => {
  const session = { ...createSession('w01d01', 'full', new Date()), stage: 'scenario' as const };
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
