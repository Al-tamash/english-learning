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
