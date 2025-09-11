import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { HelmetProvider } from 'react-helmet-async';
import HealthPage from './HealthPage';

// Mock the services
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

  it('renders health footer with configuration note', () => {
    renderWithHelmet(<HealthPage />);
    
    expect(screen.getByText(/This dashboard shows real-time status from DigitalOcean APIs/)).toBeInTheDocument();
    expect(screen.getByText(/Configure API tokens in environment variables/)).toBeInTheDocument();
  });

  it('has proper SEO meta tags', async () => {
    renderWithHelmet(<HealthPage />);
    
    // Wait for the title to be rendered by Helmet
    await waitFor(() => {
      expect(document.querySelector('title')).toBeInTheDocument();
    });
  });
});
