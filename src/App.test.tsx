import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { vi } from 'vitest';
import App from './App';
import { ErrorBoundary } from './app/ErrorBoundary';

const future = { v7_startTransition: true, v7_relativeSplatPath: true };

it('renders the app shell and navigation', () => {
  render(<MemoryRouter future={future}><App /></MemoryRouter>);
  expect(screen.getByRole('heading', { name: 'Bol' })).toBeInTheDocument();
  expect(screen.getByRole('link', { name: 'Aaj' })).toBeInTheDocument();
  expect(screen.getByRole('link', { name: 'Progress' })).toBeInTheDocument();
});

it('shows a recovery screen when a child throws', () => {
  const errorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
  const Boom = () => {
    throw new Error('boom');
  };
  render(<ErrorBoundary><Boom /></ErrorBoundary>);
  expect(screen.getByText('Kuch galat ho gaya')).toBeInTheDocument();
  expect(screen.getByRole('button', { name: 'Reset karo' })).toBeInTheDocument();
  errorSpy.mockRestore();
});
