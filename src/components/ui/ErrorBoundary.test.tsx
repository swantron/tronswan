import { render, screen, fireEvent } from '@testing-library/react';
import React from 'react';
import { vi, expect, describe, test, beforeAll, afterAll } from 'vitest';

// Mock logger before importing the component
vi.mock('../../utils/logger', () => ({
  logger: {
    apiError: vi.fn(),
    error: vi.fn(),
    warn: vi.fn(),
    info: vi.fn(),
    debug: vi.fn(),
  },
}));

import '@testing-library/jest-dom';
import { logger } from '../../utils/logger';

import ErrorBoundary from './ErrorBoundary';

// Component that throws an error for testing
const ThrowError = ({ shouldThrow }: { shouldThrow: boolean }) => {
  if (shouldThrow) {
    throw new Error('Test error');
  }
  return <div>No error</div>;
};

// Mock console.error to avoid noise in tests
const originalError = console.error;
beforeAll(() => {
  console.error = vi.fn();
});

afterAll(() => {
  console.error = originalError;
});

describe('ErrorBoundary Component', () => {
  test('renders children when no error occurs', () => {
    render(
      <ErrorBoundary>
        <div>Test content</div>
      </ErrorBoundary>
    );

    expect(screen.getByText('Test content')).toBeInTheDocument();
  });

  test('renders error UI when child throws error', () => {
    render(
      <ErrorBoundary>
        <ThrowError shouldThrow={true} />
      </ErrorBoundary>
    );

    expect(
      screen.getByText('🤖 Oops! Something went wrong')
    ).toBeInTheDocument();
    expect(
      screen.getByText(
        "We encountered an unexpected error. Don't worry, our robot engineers are on it!"
      )
    ).toBeInTheDocument();
  });

  test('renders retry button', () => {
    render(
      <ErrorBoundary>
        <ThrowError shouldThrow={true} />
      </ErrorBoundary>
    );

    const retryButton = screen.getByRole('button', { name: 'Try again' });
    expect(retryButton).toBeInTheDocument();
    expect(retryButton).toHaveAttribute('aria-label', 'Try again');
  });

  test('renders reload button', () => {
    render(
      <ErrorBoundary>
        <ThrowError shouldThrow={true} />
      </ErrorBoundary>
    );

    const reloadButton = screen.getByRole('button', { name: 'Reload page' });
    expect(reloadButton).toBeInTheDocument();
    expect(reloadButton).toHaveAttribute('aria-label', 'Reload page');
  });

  test('retry button resets error state', () => {
    const { rerender } = render(
      <ErrorBoundary>
        <ThrowError shouldThrow={true} />
      </ErrorBoundary>
    );

    // Should show error UI
    expect(
      screen.getByText('🤖 Oops! Something went wrong')
    ).toBeInTheDocument();

    // Click retry button
    const retryButton = screen.getByRole('button', { name: 'Try again' });
    fireEvent.click(retryButton);

    // Create a completely new ErrorBoundary instance without error
    rerender(
      <ErrorBoundary key='new-instance'>
        <ThrowError shouldThrow={false} />
      </ErrorBoundary>
    );

    // Should show normal content
    expect(screen.getByText('No error')).toBeInTheDocument();
    expect(
      screen.queryByText('🤖 Oops! Something went wrong')
    ).not.toBeInTheDocument();
  });

  test('reload button calls window.location.reload', () => {
    // Mock window.location.reload
    const mockReload = vi.fn();
    Object.defineProperty(window, 'location', {
      value: { reload: mockReload },
      writable: true,
    });

    render(
      <ErrorBoundary>
        <ThrowError shouldThrow={true} />
      </ErrorBoundary>
    );

    const reloadButton = screen.getByRole('button', { name: 'Reload page' });
    fireEvent.click(reloadButton);

    expect(mockReload).toHaveBeenCalled();
  });

  test('has correct CSS classes', () => {
    render(
      <ErrorBoundary>
        <ThrowError shouldThrow={true} />
      </ErrorBoundary>
    );

    expect(screen.getByTestId('error-boundary')).toHaveClass('error-boundary');
    expect(
      document.querySelector('.error-boundary-content')
    ).toBeInTheDocument();
    expect(
      document.querySelector('.error-boundary-actions')
    ).toBeInTheDocument();
  });

  test('retry button has correct CSS class', () => {
    render(
      <ErrorBoundary>
        <ThrowError shouldThrow={true} />
      </ErrorBoundary>
    );

    const retryButton = screen.getByRole('button', { name: 'Try again' });
    expect(retryButton).toHaveClass('error-boundary-retry-button');
  });

  test('reload button has correct CSS class', () => {
    render(
      <ErrorBoundary>
        <ThrowError shouldThrow={true} />
      </ErrorBoundary>
    );

    const reloadButton = screen.getByRole('button', { name: 'Reload page' });
    expect(reloadButton).toHaveClass('error-boundary-reload-button');
  });

  test('handles multiple errors correctly', () => {
    const { rerender } = render(
      <ErrorBoundary>
        <ThrowError shouldThrow={true} />
      </ErrorBoundary>
    );

    // First error
    expect(
      screen.getByText('🤖 Oops! Something went wrong')
    ).toBeInTheDocument();

    // Click retry to reset error state
    const retryButton = screen.getByRole('button', { name: 'Try again' });
    fireEvent.click(retryButton);

    // Create new ErrorBoundary instance without error
    rerender(
      <ErrorBoundary key='no-error'>
        <ThrowError shouldThrow={false} />
      </ErrorBoundary>
    );

    expect(screen.getByText('No error')).toBeInTheDocument();

    // Create new ErrorBoundary instance with error
    rerender(
      <ErrorBoundary key='with-error'>
        <ThrowError shouldThrow={true} />
      </ErrorBoundary>
    );

    expect(
      screen.getByText('🤖 Oops! Something went wrong')
    ).toBeInTheDocument();
  });

  test('maintains error state until retry is clicked', () => {
    const { rerender } = render(
      <ErrorBoundary>
        <ThrowError shouldThrow={true} />
      </ErrorBoundary>
    );

    // Should show error UI
    expect(
      screen.getByText('🤖 Oops! Something went wrong')
    ).toBeInTheDocument();

    // Re-render without error (but don't click retry)
    rerender(
      <ErrorBoundary>
        <ThrowError shouldThrow={false} />
      </ErrorBoundary>
    );

    // Should still show error UI because error state wasn't reset
    expect(
      screen.getByText('🤖 Oops! Something went wrong')
    ).toBeInTheDocument();
  });

  test('logs error details to console', () => {
    render(
      <ErrorBoundary>
        <ThrowError shouldThrow={true} />
      </ErrorBoundary>
    );

    expect(logger.error).toHaveBeenCalledWith(
      'ErrorBoundary caught an error',
      expect.objectContaining({
        error: expect.any(Error),
        errorInfo: expect.any(Object),
      })
    );
  });

  test('renders with data-testid attribute', () => {
    render(
      <ErrorBoundary>
        <ThrowError shouldThrow={true} />
      </ErrorBoundary>
    );

    expect(screen.getByTestId('error-boundary')).toBeInTheDocument();
  });
});
