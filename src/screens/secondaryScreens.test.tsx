import 'fake-indexeddb/auto';
import { fireEvent, render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { expect, it } from 'vitest';
import App from '../App';
import { createInitialState, useAppStore } from '../store/appStore';

it('shows completed days and strong words', () => {
  const state = createInitialState();
  state.days.w01d01 = {
    dayId: 'w01d01', status: 'done', stagesCompleted: ['warmup', 'pattern', 'words', 'shadow', 'scenario', 'wrap'],
    speakingSeconds: 900, selfRating: 4, missionDone: false, completedAt: new Date().toISOString(), updatedAt: new Date().toISOString(),
  };
  state.srs.w_developer = {
    itemId: 'w_developer', ease: 2.5, intervalDays: 10, dueAt: new Date().toISOString(),
    reps: 3, lapses: 0, lastRating: 'good', updatedAt: new Date().toISOString(),
  };
  useAppStore.setState(state);

  render(<MemoryRouter initialEntries={['/progress']}><App /></MemoryRouter>);
  expect(screen.getByText('Days complete: 1/7')).toBeInTheDocument();
  expect(screen.getByText('Speaking time: 15 min')).toBeInTheDocument();
  expect(screen.getByText('Words strong: 1')).toBeInTheDocument();
});

it('changes the TTS rate in Settings', () => {
  useAppStore.setState(createInitialState());
  render(<MemoryRouter initialEntries={['/settings']}><App /></MemoryRouter>);
  const slider = screen.getByRole('slider');
  fireEvent.change(slider, { target: { value: '1' } });
  expect(useAppStore.getState().settings.ttsRate).toBe(1);
});

it('re-enables voice check after consent was declined', () => {
  const state = createInitialState();
  state.settings = {
    ...state.settings,
    speechConsent: 'denied',
    speechCheckEnabled: true,
  };
  useAppStore.setState(state);

  render(<MemoryRouter initialEntries={['/settings']}><App /></MemoryRouter>);
  const checkbox = screen.getByRole('checkbox', { name: 'Voice check' });
  expect(checkbox).not.toBeChecked();

  fireEvent.click(checkbox);
  expect(useAppStore.getState().settings.speechConsent).toBe('granted');
  expect(useAppStore.getState().settings.speechCheckEnabled).toBe(true);
});
