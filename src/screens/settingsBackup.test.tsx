import 'fake-indexeddb/auto';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { afterEach, expect, it, vi } from 'vitest';
import App from '../App';
import { createInitialState, useAppStore } from '../store/appStore';
import { createBackup, serializeBackup } from '../store/backup';

const now = new Date('2026-10-26T09:00:00');

afterEach(() => {
  vi.restoreAllMocks();
});

function renderSettings() {
  useAppStore.setState(createInitialState());
  render(
    <MemoryRouter initialEntries={['/settings']}>
      <App />
    </MemoryRouter>,
  );
}

it('exports progress as a JSON download', () => {
  const createObjectURL = vi.fn(() => 'blob:backup');
  Object.defineProperty(URL, 'createObjectURL', { configurable: true, value: createObjectURL });
  Object.defineProperty(URL, 'revokeObjectURL', { configurable: true, value: vi.fn() });
  const click = vi.spyOn(HTMLAnchorElement.prototype, 'click').mockImplementation(() => {});

  renderSettings();
  fireEvent.click(screen.getByRole('button', { name: 'Export JSON' }));

  expect(createObjectURL).toHaveBeenCalled();
  expect(click).toHaveBeenCalled();
  expect(screen.getByRole('status')).toHaveTextContent('Backup download ho gaya.');
});

it('imports a backup only after confirmation', async () => {
  renderSettings();
  const data = createInitialState();
  data.days.w01d01 = {
    dayId: 'w01d01',
    status: 'done',
    stagesCompleted: ['warmup', 'pattern', 'words', 'shadow', 'scenario', 'wrap'],
    speakingSeconds: 900,
    selfRating: 4,
    missionDone: false,
    completedAt: now.toISOString(),
    updatedAt: now.toISOString(),
  };
  const text = serializeBackup(createBackup(data, now));
  const file = new File([text], 'backup.json', { type: 'application/json' });
  Object.defineProperty(file, 'text', { value: () => Promise.resolve(text) });

  fireEvent.change(screen.getByLabelText('Import JSON'), { target: { files: [file] } });
  expect(await screen.findByRole('dialog', { name: 'Backup import karein?' })).toBeInTheDocument();

  fireEvent.click(screen.getByRole('button', { name: 'Import karo' }));

  expect(useAppStore.getState().days.w01d01.status).toBe('done');
  expect(screen.getByRole('status')).toHaveTextContent('Backup import ho gaya.');
});

it('rejects an invalid backup without touching current progress', async () => {
  renderSettings();
  const file = new File(['not a backup'], 'backup.json', { type: 'application/json' });
  Object.defineProperty(file, 'text', { value: () => Promise.resolve('not a backup') });

  fireEvent.change(screen.getByLabelText('Import JSON'), { target: { files: [file] } });

  await waitFor(() =>
    expect(screen.getByRole('status')).toHaveTextContent('valid JSON nahi'),
  );
  expect(useAppStore.getState().days).toEqual({});
});
