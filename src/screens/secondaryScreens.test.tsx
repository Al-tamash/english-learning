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
  expect(screen.getByText('Days complete: 1/14')).toBeInTheDocument();
  expect(screen.getByText('Speaking time: 15 min')).toBeInTheDocument();
  expect(screen.getByText('Words strong: 1')).toBeInTheDocument();
});

it('shows a section for each authored week', () => {
  useAppStore.setState(createInitialState());
  render(
    <MemoryRouter initialEntries={['/progress']}>
      <App />
    </MemoryRouter>,
  );
  expect(screen.getByText('Week 1 · Introduce yourself and your work')).toBeInTheDocument();
  expect(screen.getByText('Week 2 · Daily routine and small talk')).toBeInTheDocument();
  expect(screen.getByText('Day 1 · What do you usually do?')).toBeInTheDocument();
});

it('links to the Week 1 lesson and printable reference', () => {
  useAppStore.setState(createInitialState());
  render(<MemoryRouter initialEntries={['/library']}><App /></MemoryRouter>);
  expect(screen.getByRole('link', { name: 'Open lesson' })).toHaveAttribute(
    'href',
    '/lessons/0001-week-1-introduce-yourself.html',
  );
  expect(screen.getByRole('link', { name: 'Printable patterns' })).toHaveAttribute(
    'href',
    '/reference/0001-week-1-patterns.html',
  );
});

it('links to the remaining weekly lessons and reference sheets', () => {
  useAppStore.setState(createInitialState());
  render(<MemoryRouter initialEntries={['/library']}><App /></MemoryRouter>);
  expect(screen.getByRole('link', { name: 'Week 7 lesson' })).toHaveAttribute(
    'href',
    '/lessons/0007-week-7-calls-and-messages.html',
  );
  expect(screen.getByRole('link', { name: 'Week 12 reference' })).toHaveAttribute(
    'href',
    '/reference/0012-week-12-patterns.html',
  );
  expect(screen.getByRole('link', { name: 'Browse all weeks' })).toHaveAttribute(
    'href',
    '/lessons/index.html',
  );
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
