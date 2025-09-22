import { describe, test, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import DigitalOceanStatus from './DigitalOceanStatus';

// Mock the CSS import
vi.mock('../styles/DigitalOceanStatus.css', () => ({}));

describe('DigitalOceanStatus Component', () => {
  const mockAppData = {
    id: 'test-app-id',
    spec: { name: 'tronswan-react-app' },
    last_deployment_active_at: '2024-01-15T10:30:00Z',
    active_deployment: {
      id: 'deployment-123',
      phase: 'ACTIVE'
    },
    region: { label: 'New York', slug: 'nyc1' },
    tier_slug: 'basic',
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-15T10:30:00Z',
    live_url: 'https://tronswan.com',
    default_ingress: 'https://tronswan.com',
    live_domain: 'tronswan.com'
  };

  const mockDropletData = [
    {
      id: 123456,
      name: 'test-droplet',
      status: 'active',
      vcpus: 2,
      memory: 4096,
      disk: 80,
      size_slug: 's-2vcpu-4gb',
      region: { name: 'New York 1' },
      image: { name: 'Ubuntu 20.04' },
      created_at: '2024-01-01T00:00:00Z',
      size: { price_monthly: 24.00 },
      networks: {
        v4: [
          { ip_address: '192.168.1.100', type: 'public' },
          { ip_address: '10.0.0.100', type: 'private' }
        ]
      },
      tags: ['production', 'web']
    }
  ];

  const defaultProps = {
    data: {
      app: null,
      droplets: [],
      loadBalancers: [],
      databases: [],
      loading: false,
      error: null
    },
    onDataChange: vi.fn()
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Loading State', () => {
    test('renders loading spinner when loading', () => {
      render(
        <DigitalOceanStatus
          {...defaultProps}
          data={{ ...defaultProps.data, loading: true }}
        />
      );

      expect(screen.getByText('🔄')).toBeInTheDocument();
      expect(screen.getByText('Loading DigitalOcean data...')).toBeInTheDocument();
    });
  });

  describe('Error State', () => {
    test('renders error message when error occurs', () => {
      const errorMessage = 'API Error';
      render(
        <DigitalOceanStatus
          {...defaultProps}
          data={{ ...defaultProps.data, error: errorMessage }}
        />
      );

      expect(screen.getByText('⚠️')).toBeInTheDocument();
      expect(screen.getByText(`Error: ${errorMessage}`)).toBeInTheDocument();
      expect(screen.getByText('Check your DigitalOcean API token configuration')).toBeInTheDocument();
    });
  });

  describe('Tab Navigation', () => {
    test('renders both tabs with correct labels', () => {
      render(<DigitalOceanStatus {...defaultProps} />);

      expect(screen.getByText('App Platform')).toBeInTheDocument();
      expect(screen.getByText('Droplets (0)')).toBeInTheDocument();
    });

    test('shows droplet count in tab', () => {
      render(
        <DigitalOceanStatus
          {...defaultProps}
          data={{ ...defaultProps.data, droplets: mockDropletData }}
        />
      );

      expect(screen.getByText('Droplets (1)')).toBeInTheDocument();
    });

    test('switches to droplets tab when clicked', () => {
      render(<DigitalOceanStatus {...defaultProps} />);

      const dropletsTab = screen.getByText('Droplets (0)');
      fireEvent.click(dropletsTab);

      expect(dropletsTab).toHaveClass('active');
      expect(screen.getByText('App Platform')).not.toHaveClass('active');
    });

    test('switches to app tab when clicked', () => {
      render(<DigitalOceanStatus {...defaultProps} />);

      const appTab = screen.getByText('App Platform');
      fireEvent.click(appTab);

      expect(appTab).toHaveClass('active');
      expect(screen.getByText('Droplets (0)')).not.toHaveClass('active');
    });
  });

  describe('App Platform Tab', () => {
    test('renders no data message when app data is not available', () => {
      render(<DigitalOceanStatus {...defaultProps} />);

      expect(screen.getByText('App information not available')).toBeInTheDocument();
    });

    test('renders app information when data is available', () => {
      render(
        <DigitalOceanStatus
          {...defaultProps}
          data={{ ...defaultProps.data, app: mockAppData }}
        />
      );

      expect(screen.getByText('tronswan-react-app')).toBeInTheDocument();
      expect(screen.getByText('DigitalOcean App Platform Application')).toBeInTheDocument();
      expect(screen.getByText('ACTIVE')).toBeInTheDocument();
      expect(screen.getByText('Phase: ACTIVE')).toBeInTheDocument();
    });

    test('renders app details correctly', () => {
      render(
        <DigitalOceanStatus
          {...defaultProps}
          data={{ ...defaultProps.data, app: mockAppData }}
        />
      );

      expect(screen.getByText('App ID:')).toBeInTheDocument();
      expect(screen.getByText('test-app-id')).toBeInTheDocument();
      expect(screen.getByText('Region:')).toBeInTheDocument();
      expect(screen.getByText('New York')).toBeInTheDocument();
      expect(screen.getByText('Tier:')).toBeInTheDocument();
      expect(screen.getByText('BASIC')).toBeInTheDocument();
    });

    test('renders links correctly', () => {
      render(
        <DigitalOceanStatus
          {...defaultProps}
          data={{ ...defaultProps.data, app: mockAppData }}
        />
      );

      const liveUrlLinks = screen.getAllByRole('link', { name: 'https://tronswan.com' });
      expect(liveUrlLinks[0]).toHaveAttribute('href', 'https://tronswan.com');
      expect(liveUrlLinks[0]).toHaveAttribute('target', '_blank');
      expect(liveUrlLinks[0]).toHaveAttribute('rel', 'noopener noreferrer');
    });

    test('handles missing app data gracefully', () => {
      const incompleteAppData = {
        id: 'test-app-id',
        // Missing most fields
      };

      render(
        <DigitalOceanStatus
          {...defaultProps}
          data={{ ...defaultProps.data, app: incompleteAppData }}
        />
      );

      expect(screen.getAllByText('N/A')).toHaveLength(10);
    });
  });

  describe('Droplets Tab', () => {
    test('renders no droplets message when no droplets', () => {
      render(<DigitalOceanStatus {...defaultProps} />);

      // Switch to droplets tab
      fireEvent.click(screen.getByText('Droplets (0)'));

      expect(screen.getByText('No droplets found')).toBeInTheDocument();
    });

    test('renders droplets list when droplets are available', () => {
      render(
        <DigitalOceanStatus
          {...defaultProps}
          data={{ ...defaultProps.data, droplets: mockDropletData }}
        />
      );

      // Switch to droplets tab
      fireEvent.click(screen.getByText('Droplets (1)'));

      expect(screen.getByText('test-droplet')).toBeInTheDocument();
      expect(screen.getByText(/active/)).toBeInTheDocument();
      expect(screen.getByText(/vCPUs:/)).toBeInTheDocument();
      expect(screen.getByText((content, element) => {
        return element?.textContent === 'vCPUs: 2';
      })).toBeInTheDocument();
      expect(screen.getByText(/4 GB/)).toBeInTheDocument();
      expect(screen.getByText(/80 GB/)).toBeInTheDocument();
    });

    test('renders droplet network information', () => {
      render(
        <DigitalOceanStatus
          {...defaultProps}
          data={{ ...defaultProps.data, droplets: mockDropletData }}
        />
      );

      // Switch to droplets tab
      fireEvent.click(screen.getByText('Droplets (1)'));

      expect(screen.getByText('IP Addresses:')).toBeInTheDocument();
      expect(screen.getByText('192.168.1.100 (public)')).toBeInTheDocument();
      expect(screen.getByText('10.0.0.100 (private)')).toBeInTheDocument();
    });

    test('renders droplet tags when available', () => {
      render(
        <DigitalOceanStatus
          {...defaultProps}
          data={{ ...defaultProps.data, droplets: mockDropletData }}
        />
      );

      // Switch to droplets tab
      fireEvent.click(screen.getByText('Droplets (1)'));

      expect(screen.getByText('Tags:')).toBeInTheDocument();
      expect(screen.getByText('production')).toBeInTheDocument();
      expect(screen.getByText('web')).toBeInTheDocument();
    });
  });

  describe('Status Icons and Classes', () => {
    test('renders correct status icon for active status', () => {
      render(
        <DigitalOceanStatus
          {...defaultProps}
          data={{ ...defaultProps.data, app: { ...mockAppData, last_deployment_active_at: '2024-01-15T10:30:00Z' } }}
        />
      );

      expect(screen.getByText(/✅/)).toBeInTheDocument();
    });

    test('renders correct status icon for inactive status', () => {
      render(
        <DigitalOceanStatus
          {...defaultProps}
          data={{ ...defaultProps.data, app: { ...mockAppData, last_deployment_active_at: null } }}
        />
      );

      expect(screen.getByText(/❓/)).toBeInTheDocument();
    });
  });

  describe('Utility Functions', () => {
    test('formats bytes correctly', () => {
      // Test the formatBytes function indirectly through droplet rendering
      render(
        <DigitalOceanStatus
          {...defaultProps}
          data={{ ...defaultProps.data, droplets: mockDropletData }}
        />
      );

      // Switch to droplets tab
      fireEvent.click(screen.getByText('Droplets (1)'));

      expect(screen.getByText(/4 GB/)).toBeInTheDocument();
      expect(screen.getByText(/80 GB/)).toBeInTheDocument();
    });

    test('formats price correctly', () => {
      render(
        <DigitalOceanStatus
          {...defaultProps}
          data={{ ...defaultProps.data, droplets: mockDropletData }}
        />
      );

      // Switch to droplets tab
      fireEvent.click(screen.getByText('Droplets (1)'));

      expect(screen.getByText(/\$24\.00/)).toBeInTheDocument();
    });
  });

  describe('Edge Cases', () => {
    test('handles empty droplets array', () => {
      render(
        <DigitalOceanStatus
          {...defaultProps}
          data={{ ...defaultProps.data, droplets: [] }}
        />
      );

      // Switch to droplets tab
      fireEvent.click(screen.getByText('Droplets (0)'));

      expect(screen.getByText('No droplets found')).toBeInTheDocument();
    });

    test('handles null droplets', () => {
      render(
        <DigitalOceanStatus
          {...defaultProps}
          data={{ ...defaultProps.data, droplets: null }}
        />
      );

      // Switch to droplets tab
      fireEvent.click(screen.getByText('Droplets (0)'));

      expect(screen.getByText('No droplets found')).toBeInTheDocument();
    });

    test('handles droplets without tags', () => {
      const dropletWithoutTags = {
        ...mockDropletData[0],
        tags: []
      };

      render(
        <DigitalOceanStatus
          {...defaultProps}
          data={{ ...defaultProps.data, droplets: [dropletWithoutTags] }}
        />
      );

      // Switch to droplets tab
      fireEvent.click(screen.getByText('Droplets (1)'));

      expect(screen.queryByText('Tags:')).not.toBeInTheDocument();
    });
  });
});
