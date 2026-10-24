import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { expect, it } from 'vitest';
import App from '../App';
import { BENCHMARK_PROMPTS, getDay } from '../content';
import { createInitialState, useAppStore } from '../store/appStore';
import { createSession } from '../session/engine';

it('completes a learning day after the quiz and rating', async () => {
  const day = getDay('w01d01');
  const session = { ...createSession('w01d01', 'full', new Date()), stage: 'wrap' as const };
  useAppStore.setState({ ...createInitialState(), activeSession: session });

  render(<MemoryRouter initialEntries={['/session']}><App /></MemoryRouter>);
  const user = userEvent.setup();

  for (const quiz of day.quiz) {
    await user.type(screen.getByRole('textbox'), quiz.answer);
    await user.click(screen.getByRole('button', { name: 'Check' }));
    await user.click(screen.getByRole('button', { name: 'Aage' }));
  }

  await user.click(screen.getByRole('button', { name: '4' }));
  await user.click(screen.getByRole('button', { name: 'Session khatam' }));

  expect(useAppStore.getState().days.w01d01.status).toBe('done');
  expect(useAppStore.getState().activeSession).toBeNull();
});

it('shows four benchmark prompts on the review day', async () => {
  const day = getDay('w01d07');
  const session = { ...createSession('w01d07', 'full', new Date()), stage: 'wrap' as const };
  useAppStore.setState({ ...createInitialState(), activeSession: session });
  render(<MemoryRouter initialEntries={['/session']}><App /></MemoryRouter>);

  const user = userEvent.setup();
  for (const quiz of day.quiz) {
    await user.type(screen.getByRole('textbox'), quiz.answer);
    await user.click(screen.getByRole('button', { name: 'Check' }));
    await user.click(screen.getByRole('button', { name: 'Aage' }));
  }

  for (const prompt of BENCHMARK_PROMPTS) {
    expect(screen.getByText(prompt.en)).toBeInTheDocument();
  }
  expect(screen.getByText(day.mission!.title_hi)).toBeInTheDocument();
});
