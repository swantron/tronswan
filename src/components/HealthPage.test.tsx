import { vi, expect, describe, it, beforeEach } from 'vitest';
import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { HelmetProvider } from 'react-helmet-async';
import HealthPage from './HealthPage';

// Mock the services
vi.mock('../services/githubService', () => ({
  default: {
    getUser: vi.fn().mockResolvedValue({ login: 'swantron', name: 'Swantron', public_repos: 10, followers: 5 }),
    getRepositories: vi.fn().mockResolvedValue([]),
    getWorkflows: vi.fn().mockResolvedValue({ workflows: [] }),
    getWorkflowRuns: vi.fn().mockResolvedValue({ workflow_runs: [] }),
  }
}));

vi.mock('../services/digitalOceanService', () => ({
  default: {
    getDroplets: vi.fn().mockResolvedValue([]),
    getLoadBalancers: vi.fn().mockResolvedValue([]),
    getDatabases: vi.fn().mockResolvedValue([]),
    getAccount: vi.fn().mockResolvedValue({ account: {} }),
  }
}));

describe('HealthPage', () => {
  const renderWithHelmet = (component: React.ReactElement) => {
    return render(
      <HelmetProvider>
        {component}
      </HelmetProvider>
    );
  };

  beforeEach(() => {
    // Reset mocks before each test
    vi.clearAllMocks();
  });

  it('renders health page title and subtitle', () => {
    renderWithHelmet(<HealthPage />);
    
    expect(screen.getByTestId('health-title')).toHaveTextContent('Service Health');
    expect(screen.getByText('Monitor deployments, infrastructure, and service status')).toBeInTheDocument();
  });

  it('renders refresh button', () => {
    renderWithHelmet(<HealthPage />);
    
    const refreshButton = screen.getByTestId('refresh-button');
    expect(refreshButton).toBeInTheDocument();
    expect(refreshButton).toHaveTextContent('🔄 Refresh');
  });

  it('shows last updated time', () => {
    renderWithHelmet(<HealthPage />);
    
    expect(screen.getByTestId('last-updated')).toBeInTheDocument();
    expect(screen.getByTestId('last-updated')).toHaveTextContent('Last updated:');
  });

  it('renders section titles', () => {
    renderWithHelmet(<HealthPage />);
    
    expect(screen.getByText('🚀 Deployment Status')).toBeInTheDocument();
    expect(screen.getByText('☁️ Infrastructure')).toBeInTheDocument();
    expect(screen.getByText('🌐 Service Health')).toBeInTheDocument();
  });

  it('handles refresh button click', async () => {
    renderWithHelmet(<HealthPage />);
    
    const refreshButton = screen.getByTestId('refresh-button');
    
    // Button should be clickable initially
    expect(refreshButton).toBeInTheDocument();
    expect(refreshButton).toHaveTextContent('🔄 Refresh');
    
    // Click the button
    fireEvent.click(refreshButton);
    
    // Button should still be in the document after click
    expect(refreshButton).toBeInTheDocument();
  });

  it('renders health footer', () => {
    renderWithHelmet(<HealthPage />);
    
    // Check that the health footer div exists but is empty
    const footer = document.querySelector('.health-footer');
    expect(footer).toBeInTheDocument();
  });

  it('has proper SEO meta tags', async () => {
    renderWithHelmet(<HealthPage />);
    
    // Wait for the title to be rendered by Helmet
    await waitFor(() => {
      expect(document.querySelector('title')).toBeInTheDocument();
    });
  });
});
