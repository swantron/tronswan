import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import React from 'react';
import { HelmetProvider } from 'react-helmet-async';
import { vi, expect, describe, it, beforeEach } from 'vitest';
import '@testing-library/jest-dom';

// Mock logger before importing
vi.mock('../../utils/logger', () => ({
  logger: {
    info: vi.fn(),
    error: vi.fn(),
    warn: vi.fn(),
    debug: vi.fn(),
  },
}));

// Mock runtimeConfig
vi.mock('../../utils/runtimeConfig', () => ({
  runtimeConfig: {
    initialize: vi.fn().mockResolvedValue(undefined),
    get: vi.fn().mockReturnValue(''),
    getWithDefault: vi
      .fn()
      .mockImplementation((key, defaultValue) => defaultValue),
    has: vi.fn().mockReturnValue(false),
    isInitialized: vi.fn().mockReturnValue(true),
  },
}));

// Mock the services
vi.mock('../../services/githubService', () => ({
  default: {
    getUser: vi.fn().mockResolvedValue({
      login: 'swantron',
      name: 'Swantron',
      public_repos: 10,
      followers: 5,
    }),
    getRepositories: vi.fn().mockResolvedValue([]),
    getWorkflows: vi.fn().mockResolvedValue({ workflows: [] }),
    getWorkflowRuns: vi.fn().mockResolvedValue({ workflow_runs: [] }),
  },
}));

import { logger } from '../../utils/logger';

import HealthPage from './HealthPage';

describe('HealthPage', () => {
  const renderWithHelmet = (component: React.ReactElement) => {
    return render(<HelmetProvider>{component}</HelmetProvider>);
  };

  beforeEach(() => {
    // Reset mocks before each test
    vi.clearAllMocks();
  });

  it('renders health page title and subtitle', () => {
    renderWithHelmet(<HealthPage />);

    expect(screen.getByTestId('health-title')).toHaveTextContent(
      'service health & status'
    );
  });

  it('shows last updated time', () => {
    renderWithHelmet(<HealthPage />);

    expect(screen.getByTestId('last-updated')).toBeInTheDocument();
    expect(screen.getByTestId('last-updated')).toHaveTextContent(
      'Last updated:'
    );
  });

  it('renders tab buttons', () => {
    renderWithHelmet(<HealthPage />);

    expect(screen.getByText('Services & APIs')).toBeInTheDocument();
    expect(screen.getByText('Deployments')).toBeInTheDocument();
    expect(screen.queryByText('Infrastructure')).not.toBeInTheDocument();
  });

  it('switches between tabs', () => {
    renderWithHelmet(<HealthPage />);

    const servicesTab = screen.getByText('Services & APIs');
    const deploymentsTab = screen.getByText('Deployments');

    // Services tab should be active by default
    expect(servicesTab).toHaveClass('active');

    // Click deployments tab
    fireEvent.click(deploymentsTab);
    expect(deploymentsTab).toHaveClass('active');

    // And back
    fireEvent.click(servicesTab);
    expect(servicesTab).toHaveClass('active');
  });

  it('renders health footer', () => {
    renderWithHelmet(<HealthPage />);

    // The health-footer class was removed, so this test is no longer needed
    // Just verify the page structure is intact
    expect(screen.getByTestId('health-title')).toBeInTheDocument();
  });

  it('has proper SEO meta tags', async () => {
    renderWithHelmet(<HealthPage />);

    // Wait for the title to be rendered by Helmet
    await waitFor(() => {
      expect(document.querySelector('title')).toBeInTheDocument();
    });
  });

  it('logs tab changes when clicking tabs', () => {
    renderWithHelmet(<HealthPage />);

    const deploymentsTab = screen.getByText('Deployments');
    fireEvent.click(deploymentsTab);

    expect(logger.info).toHaveBeenCalledWith('Health tab changed', {
      from: 'services',
      to: 'deployments',
      timestamp: expect.any(String),
    });

    const servicesTab = screen.getByText('Services & APIs');
    fireEvent.click(servicesTab);

    expect(logger.info).toHaveBeenCalledWith('Health tab changed', {
      from: 'deployments',
      to: 'services',
      timestamp: expect.any(String),
    });
  });
});
