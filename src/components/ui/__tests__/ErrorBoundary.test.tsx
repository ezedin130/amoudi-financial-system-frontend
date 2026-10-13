import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import React from 'react';
import { ErrorBoundary } from '../ErrorBoundary';

const BombComponent: React.FC<{ shouldThrow?: boolean }> = ({ shouldThrow }) => {
  if (shouldThrow) {
    throw new Error('Database password and stack trace should never be exposed');
  }
  return <div>Normal Content Rendered Successfully</div>;
};

describe('ErrorBoundary Component', () => {
  // Suppress console.error in tests for intentional render error
  const originalConsoleError = console.error;
  beforeEach(() => {
    console.error = vi.fn();
  });
  afterEach(() => {
    console.error = originalConsoleError;
  });

  it('renders children when no error occurs', () => {
    render(
      <ErrorBoundary>
        <BombComponent shouldThrow={false} />
      </ErrorBoundary>
    );

    expect(screen.getByText('Normal Content Rendered Successfully')).toBeInTheDocument();
  });

  it('catches render error and displays safe recovery UI without stack traces', () => {
    render(
      <ErrorBoundary>
        <BombComponent shouldThrow={true} />
      </ErrorBoundary>
    );

    expect(screen.getByText('Something went wrong')).toBeInTheDocument();
    expect(
      screen.getByText(/An unexpected error occurred while rendering this view/i)
    ).toBeInTheDocument();

    // Verify raw error/stack trace is NOT displayed to the user
    expect(
      screen.queryByText(/Database password and stack trace/i)
    ).not.toBeInTheDocument();

    // Verify recovery buttons
    expect(screen.getByRole('button', { name: /Refresh Page/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Return to Dashboard/i })).toBeInTheDocument();
  });

  it('renders custom fallback if provided', () => {
    render(
      <ErrorBoundary fallback={<div data-testid="custom-fallback">Custom Safe View</div>}>
        <BombComponent shouldThrow={true} />
      </ErrorBoundary>
    );

    expect(screen.getByTestId('custom-fallback')).toHaveTextContent('Custom Safe View');
  });

  it('handles refresh button click', () => {
    const reloadMock = vi.fn();
    Object.defineProperty(window, 'location', {
      value: { reload: reloadMock, href: 'http://localhost:5173/current' },
      writable: true,
    });

    render(
      <ErrorBoundary>
        <BombComponent shouldThrow={true} />
      </ErrorBoundary>
    );

    const refreshBtn = screen.getByRole('button', { name: /Refresh Page/i });
    fireEvent.click(refreshBtn);

    expect(reloadMock).toHaveBeenCalled();
  });
});
