import { Component, type ErrorInfo, type ReactNode } from 'react';

interface ErrorBoundaryProps {
  children: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
}

export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  state: ErrorBoundaryState = { hasError: false };

  static getDerivedStateFromError(): ErrorBoundaryState {
    return { hasError: true };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error('Bol render error', error, info);
  }

  render() {
    if (this.state.hasError) {
      return (
        <main className="mx-auto flex min-h-screen max-w-lg flex-col items-start justify-center gap-4 p-6">
          <h1 className="text-2xl font-bold">Kuch galat ho gaya</h1>
          <p className="text-muted">
            App ko reload karke dobara try karo. Tumhari saved progress safe hai.
          </p>
          <button
            type="button"
            className="rounded-xl bg-accent px-4 py-2 font-semibold text-accent-ink"
            onClick={() => window.location.reload()}
          >
            Reset karo
          </button>
        </main>
      );
    }

    return this.props.children;
  }
}
