import { cleanup, render, screen } from '@testing-library/react';
import { expect, it } from 'vitest';
import { reportSave } from '../store/saveStatus';
import { SaveIndicator } from './SaveIndicator';

it('shows that progress is saved locally', () => {
  reportSave('saved');
  render(<SaveIndicator />);
  expect(screen.getByText('Saved locally')).toBeInTheDocument();
  cleanup();
});

it('shows a warning when browser storage fails', () => {
  reportSave('error');
  render(<SaveIndicator />);
  expect(screen.getByText('Save failed')).toBeInTheDocument();
  cleanup();
  reportSave('saved');
});
