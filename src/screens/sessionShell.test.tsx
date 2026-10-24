import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { expect, it, vi } from 'vitest';
import App from '../App';
import { createInitialState, useAppStore } from '../store/appStore';
import { createSession } from '../session/engine';

vi.mock('../audio/tts', () => ({
  speak: vi.fn().mockResolvedValue(undefined),
  stopSpeaking: vi.fn(),
}));

it('renders the pattern stage and advances only once', async () => {
  const now = new Date('2026-10-24T09:00:00');
  const session = { ...createSession('w01d01', 'full', now), stage: 'pattern' as const };
  useAppStore.setState({ ...createInitialState(), activeSession: session });

  render(<MemoryRouter initialEntries={['/session']}><App /></MemoryRouter>);
  expect(screen.getByText('I work at ___ as a ___.')).toBeInTheDocument();

  const user = userEvent.setup();
  await user.click(screen.getByRole('button', { name: 'Aage badho' }));
  useAppStore.getState().completeStage('pattern');
  expect(useAppStore.getState().activeSession?.stage).toBe('words');
});
