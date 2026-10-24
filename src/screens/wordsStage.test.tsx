import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { expect, it, vi } from 'vitest';
import { WordsStage } from './stages/WordsStage';
import { getDay } from '../content';
import { createInitialState, useAppStore } from '../store/appStore';
import { createSession } from '../session/engine';

vi.mock('../audio/tts', () => ({ speak: vi.fn().mockResolvedValue(undefined), stopSpeaking: vi.fn() }));

it('rates a word and schedules it', async () => {
  const now = new Date('2026-10-24T09:00:00');
  const session = { ...createSession('w01d01', 'full', now), stage: 'words' as const };
  useAppStore.setState({ ...createInitialState(), activeSession: session });

  render(<WordsStage day={getDay('w01d01')} />);
  expect(screen.getByText('developer')).toBeInTheDocument();

  const user = userEvent.setup();
  await user.click(screen.getByRole('button', { name: 'Theek' }));

  const card = useAppStore.getState().srs.w_developer;
  expect(card.intervalDays).toBe(1);
  expect(screen.getByText('client')).toBeInTheDocument();
});
