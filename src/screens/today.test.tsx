import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { expect, it } from 'vitest';
import App from '../App';
import { createInitialState, useAppStore } from '../store/appStore';

it('shows Day 1 and starts a full session', async () => {
  useAppStore.setState(createInitialState());
  render(<MemoryRouter initialEntries={['/']}><App /></MemoryRouter>);

  expect(screen.getByText('Day 1 · Week 1')).toBeInTheDocument();
  expect(screen.getByText('What do you do?')).toBeInTheDocument();
  expect(screen.getByText('Streak: 0 din')).toBeInTheDocument();

  await userEvent.click(screen.getByRole('button', { name: 'Start 30 min' }));
  expect(useAppStore.getState().activeSession?.mode).toBe('full');
});

function completeDays(ids: string[]) {
  const state = createInitialState();
  for (const dayId of ids) {
    state.days[dayId] = {
      dayId,
      status: 'done',
      stagesCompleted: ['warmup', 'wrap'],
      speakingSeconds: 600,
      selfRating: 4,
      missionDone: false,
      completedAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
  }
  return state;
}

it('moves into Week 2 after Week 1 is complete', () => {
  useAppStore.setState(
    completeDays([
      'w01d01',
      'w01d02',
      'w01d03',
      'w01d04',
      'w01d05',
      'w01d06',
      'w01d07',
    ]),
  );
  render(
    <MemoryRouter initialEntries={['/']}>
      <App />
    </MemoryRouter>,
  );

  expect(screen.getByText('Day 1 · Week 2')).toBeInTheDocument();
  expect(screen.getByText('What do you usually do?')).toBeInTheDocument();
  expect(screen.getByText('0 / 7 din')).toBeInTheDocument();
});

it('shows the next-week fallback when authored content is exhausted', () => {
  useAppStore.setState(
    completeDays([
      'w01d01',
      'w01d02',
      'w01d03',
      'w01d04',
      'w01d05',
      'w01d06',
      'w01d07',
      'w02d01',
      'w02d02',
      'w02d03',
      'w02d04',
      'w02d05',
      'w02d06',
      'w02d07',
    ]),
  );
  render(
    <MemoryRouter initialEntries={['/']}>
      <App />
    </MemoryRouter>,
  );

  expect(screen.getByText('Week 2 complete')).toBeInTheDocument();
  expect(screen.getByText('Week 3 jald aa raha hai.')).toBeInTheDocument();
});
