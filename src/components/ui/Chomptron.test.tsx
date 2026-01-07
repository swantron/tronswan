import { render, screen, waitFor } from '@testing-library/react';
import React from 'react';
import { BrowserRouter } from 'react-router-dom';
import { vi, expect, describe, test } from 'vitest';
import '@testing-library/jest-dom';

// Mock logger before importing
vi.mock('../../utils/logger', () => ({
  logger: {
    info: vi.fn(),
    error: vi.fn(),
    warn: vi.fn(),
  },
}));

// Mock SEO component
vi.mock('./SEO', () => ({
  default: function MockSEO({ title, description, keywords, url }) {
    return (
      <div
        data-testid='seo-component'
        data-title={title}
        data-description={description}
        data-keywords={keywords}
        data-url={url}
      >
        SEO Component
      </div>
    );
  },
}));

// Mock CSS
vi.mock('../../styles/Chomptron.css', () => ({}));

import { logger } from '../../utils/logger';

import Chomptron from './Chomptron';

const renderWithRouter = component => {
  return render(<BrowserRouter>{component}</BrowserRouter>);
};

describe('Chomptron Component', () => {
  test('renders chomptron page', () => {
    renderWithRouter(<Chomptron />);
    expect(screen.getByTestId('chomptron-container')).toBeInTheDocument();
    expect(screen.getByText('chomptron')).toBeInTheDocument();
  });

  test('renders SEO component with correct props', () => {
    renderWithRouter(<Chomptron />);
    const seoComponent = screen.getByTestId('seo-component');
    expect(seoComponent).toHaveAttribute(
      'data-title',
      'Chomptron - AI Recipe App | Tron Swan'
    );
    expect(seoComponent).toHaveAttribute(
      'data-description',
      'AI-powered recipe app with Gemini. Explore recipes powered by Google Gemini AI.'
    );
    expect(seoComponent).toHaveAttribute('data-url', '/chomptron');
  });

  test('renders external link to chomptron.com', () => {
    renderWithRouter(<Chomptron />);
    const externalLink = screen.getByText('chomptron.com');
    expect(externalLink).toBeInTheDocument();
    expect(externalLink.closest('a')).toHaveAttribute(
      'href',
      'https://chomptron.com'
    );
    expect(externalLink.closest('a')).toHaveAttribute('target', '_blank');
    expect(externalLink.closest('a')).toHaveAttribute(
      'rel',
      'noopener noreferrer'
    );
  });

  test('logs page load on mount', () => {
    renderWithRouter(<Chomptron />);
    expect(logger.info).toHaveBeenCalledWith('Chomptron page loaded', {
      timestamp: expect.any(String),
    });
  });

  test('renders descriptive text about chomptron', () => {
    renderWithRouter(<Chomptron />);
    expect(screen.getByText(/Visit/)).toBeInTheDocument();
    expect(
      screen.getByText(
        /for the full experience with recipe history, favorites, and more/
      )
    ).toBeInTheDocument();
  });

  test('displays quota warning when API quota is exceeded', () => {
    // Mock localStorage
    const localStorageMock = {
      getItem: vi.fn((key: string) => {
        if (key === 'chomptron_quota_error') return 'true';
        if (key === 'chomptron_retry_after') return '60';
        return null;
      }),
      setItem: vi.fn(),
      removeItem: vi.fn(),
    };
    Object.defineProperty(window, 'localStorage', {
      value: localStorageMock,
      writable: true,
    });

    renderWithRouter(<Chomptron />);

    expect(screen.getByTestId('quota-warning')).toBeInTheDocument();
    expect(screen.getByText(/API Quota Exceeded/)).toBeInTheDocument();
    expect(screen.getByText(/Please retry in/)).toBeInTheDocument();
  });

  test('does not display quota warning when API is available', () => {
    const localStorageMock = {
      getItem: vi.fn(() => null),
      setItem: vi.fn(),
      removeItem: vi.fn(),
    };
    Object.defineProperty(window, 'localStorage', {
      value: localStorageMock,
      writable: true,
    });

    renderWithRouter(<Chomptron />);

    expect(screen.queryByTestId('quota-warning')).not.toBeInTheDocument();
  });

  test('formats retry time correctly', () => {
    const localStorageMock = {
      getItem: vi.fn((key: string) => {
        if (key === 'chomptron_quota_error') return 'true';
        if (key === 'chomptron_retry_after') return '125'; // 2 minutes 5 seconds
        return null;
      }),
      setItem: vi.fn(),
      removeItem: vi.fn(),
    };
    Object.defineProperty(window, 'localStorage', {
      value: localStorageMock,
      writable: true,
    });

    renderWithRouter(<Chomptron />);

    expect(screen.getByText(/2 minutes 5 seconds/)).toBeInTheDocument();
  });

  test('formats retry time for seconds only', () => {
    const localStorageMock = {
      getItem: vi.fn((key: string) => {
        if (key === 'chomptron_quota_error') return 'true';
        if (key === 'chomptron_retry_after') return '45';
        return null;
      }),
      setItem: vi.fn(),
      removeItem: vi.fn(),
    };
    Object.defineProperty(window, 'localStorage', {
      value: localStorageMock,
      writable: true,
    });

    renderWithRouter(<Chomptron />);

    expect(screen.getByText(/45 seconds/)).toBeInTheDocument();
  });

  test('formats retry time for minutes only', () => {
    const localStorageMock = {
      getItem: vi.fn((key: string) => {
        if (key === 'chomptron_quota_error') return 'true';
        if (key === 'chomptron_retry_after') return '120'; // 2 minutes exactly
        return null;
      }),
      setItem: vi.fn(),
      removeItem: vi.fn(),
    };
    Object.defineProperty(window, 'localStorage', {
      value: localStorageMock,
      writable: true,
    });

    renderWithRouter(<Chomptron />);

    expect(screen.getByText(/2 minutes/)).toBeInTheDocument();
    expect(screen.queryByText(/second/)).not.toBeInTheDocument();
  });

  test('handles localStorage errors gracefully', () => {
    const localStorageMock = {
      getItem: vi.fn(() => {
        throw new Error('localStorage error');
      }),
      setItem: vi.fn(),
      removeItem: vi.fn(),
    };
    Object.defineProperty(window, 'localStorage', {
      value: localStorageMock,
      writable: true,
    });

    renderWithRouter(<Chomptron />);

    expect(logger.warn).toHaveBeenCalledWith(
      'Error checking chomptron API status',
      { error: expect.any(Error) }
    );
    expect(screen.queryByTestId('quota-warning')).not.toBeInTheDocument();
  });

  test('listens for storage events', () => {
    const localStorageMock = {
      getItem: vi.fn(() => null),
      setItem: vi.fn(),
      removeItem: vi.fn(),
    };
    Object.defineProperty(window, 'localStorage', {
      value: localStorageMock,
      writable: true,
    });

    const addEventListenerSpy = vi.spyOn(window, 'addEventListener');
    const removeEventListenerSpy = vi.spyOn(window, 'removeEventListener');

    const { unmount } = renderWithRouter(<Chomptron />);

    expect(addEventListenerSpy).toHaveBeenCalledWith(
      'storage',
      expect.any(Function)
    );

    unmount();

    expect(removeEventListenerSpy).toHaveBeenCalledWith(
      'storage',
      expect.any(Function)
    );
  });

  test('updates on storage event for quota error', async () => {
    const localStorageMock = {
      getItem: vi.fn((key: string) => {
        if (key === 'chomptron_quota_error') return null;
        return null;
      }),
      setItem: vi.fn(),
      removeItem: vi.fn(),
    };
    Object.defineProperty(window, 'localStorage', {
      value: localStorageMock,
      writable: true,
    });

    renderWithRouter(<Chomptron />);

    expect(screen.queryByTestId('quota-warning')).not.toBeInTheDocument();

    // Simulate storage event
    localStorageMock.getItem.mockImplementation((key: string) => {
      if (key === 'chomptron_quota_error') return 'true';
      if (key === 'chomptron_retry_after') return '60';
      return null;
    });

    const storageEvent: any = new window.Event('storage');
    storageEvent.key = 'chomptron_quota_error';
    storageEvent.newValue = 'true';
    window.dispatchEvent(storageEvent);

    // Should now show warning
    await waitFor(() => {
      expect(screen.getByTestId('quota-warning')).toBeInTheDocument();
    });
  });

  test('does not show retry time when retryAfter is null', () => {
    const localStorageMock = {
      getItem: vi.fn((key: string) => {
        if (key === 'chomptron_quota_error') return 'true';
        if (key === 'chomptron_retry_after') return null;
        return null;
      }),
      setItem: vi.fn(),
      removeItem: vi.fn(),
    };
    Object.defineProperty(window, 'localStorage', {
      value: localStorageMock,
      writable: true,
    });

    renderWithRouter(<Chomptron />);

    expect(screen.getByTestId('quota-warning')).toBeInTheDocument();
    expect(screen.queryByText(/Please retry in/)).not.toBeInTheDocument();
  });

  test('renders quick generator widget', () => {
    renderWithRouter(<Chomptron />);
    expect(screen.getByTestId('ingredient-input')).toBeInTheDocument();
    expect(screen.getByTestId('generate-button')).toBeInTheDocument();
    expect(
      screen.getByPlaceholderText(/chicken, tomatoes, garlic, pasta/)
    ).toBeInTheDocument();
  });

  test('generate button is disabled when input is empty', () => {
    renderWithRouter(<Chomptron />);
    const button = screen.getByTestId('generate-button');
    expect(button).toBeDisabled();
  });

  test('handles storage event for quota error', async () => {
    const localStorageMock = {
      getItem: vi.fn(() => null),
      setItem: vi.fn(),
      removeItem: vi.fn(),
    };
    Object.defineProperty(window, 'localStorage', {
      value: localStorageMock,
      writable: true,
    });

    renderWithRouter(<Chomptron />);

    expect(screen.queryByTestId('quota-warning')).not.toBeInTheDocument();

    // Simulate storage event with quota error
    localStorageMock.getItem.mockImplementation((key: string) => {
      if (key === 'chomptron_quota_error') return 'true';
      if (key === 'chomptron_retry_after') return '120';
      return null;
    });

    const storageEvent: any = new window.Event('storage');
    storageEvent.key = 'chomptron_quota_error';
    storageEvent.newValue = 'true';
    window.dispatchEvent(storageEvent);

    await waitFor(() => {
      expect(screen.getByTestId('quota-warning')).toBeInTheDocument();
    });
  });

  test('clears quota warning when storage event resolves', async () => {
    const localStorageMock = {
      getItem: vi.fn((key: string) => {
        if (key === 'chomptron_quota_error') return 'true';
        if (key === 'chomptron_retry_after') return '60';
        return null;
      }),
      setItem: vi.fn(),
      removeItem: vi.fn(),
    };
    Object.defineProperty(window, 'localStorage', {
      value: localStorageMock,
      writable: true,
    });

    renderWithRouter(<Chomptron />);

    expect(screen.getByTestId('quota-warning')).toBeInTheDocument();

    // Simulate storage event clearing quota error
    localStorageMock.getItem.mockImplementation(() => null);

    const storageEvent: any = new window.Event('storage');
    storageEvent.key = 'chomptron_quota_error';
    storageEvent.newValue = null;
    window.dispatchEvent(storageEvent);

    await waitFor(() => {
      expect(screen.queryByTestId('quota-warning')).not.toBeInTheDocument();
    });
  });

  test('ignores storage events for unrelated keys', async () => {
    const localStorageMock = {
      getItem: vi.fn(() => null),
      setItem: vi.fn(),
      removeItem: vi.fn(),
    };
    Object.defineProperty(window, 'localStorage', {
      value: localStorageMock,
      writable: true,
    });

    renderWithRouter(<Chomptron />);

    const storageEvent: any = new window.Event('storage');
    storageEvent.key = 'some_other_key';
    storageEvent.newValue = 'value';
    window.dispatchEvent(storageEvent);

    // Should not trigger any state change
    expect(screen.queryByTestId('quota-warning')).not.toBeInTheDocument();
  });
});
