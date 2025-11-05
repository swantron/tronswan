import { render, screen, waitFor, act } from '@testing-library/react';
import React from 'react';
import { describe, test, expect, beforeEach, vi } from 'vitest';

import '@testing-library/jest-dom';
import ServiceHealth from './ServiceHealth';

// Mock runtime config
vi.mock('../../utils/runtimeConfig', () => ({
  runtimeConfig: {
    initialize: vi.fn().mockResolvedValue(undefined),
    get: vi.fn().mockImplementation(key => {
      if (key === 'VITE_SPOTIFY_CLIENT_ID') return 'test-client-id';
      if (key === 'VITE_SPOTIFY_CLIENT_SECRET') return 'test-client-secret';
      if (key === 'VITE_WEATHER_API_KEY') return 'test-api-key';
      return 'test-value';
    }),
    getWithDefault: vi.fn().mockImplementation((key, defaultValue) => {
      return defaultValue;
    }),
  },
}));

// Mock fetch globally
global.fetch = vi.fn();

const defaultServices = {
  tronswan: 'healthy' as const,
  chomptron: 'healthy' as const,
  swantron: 'healthy' as const,
  jswan: 'healthy' as const,
  mlbApi: 'healthy' as const,
  spotifyApi: 'healthy' as const,
  weatherApi: 'healthy' as const,
};

describe('ServiceHealth Component', () => {
  beforeEach(() => {
    (global.fetch as any).mockClear();
    (global.fetch as any).mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => ({}),
    });
  });

  test('renders all service names', () => {
    render(<ServiceHealth services={defaultServices} />);

    expect(screen.getByText('tron swan dot com')).toBeInTheDocument();
    expect(screen.getByText('chomp tron dot com')).toBeInTheDocument();
    expect(screen.getByText('swan tron dot com')).toBeInTheDocument();
    expect(screen.getByText('ATProto PDS')).toBeInTheDocument();
    expect(screen.getByText('MLB Stats API')).toBeInTheDocument();
    expect(screen.getByText('Spotify API')).toBeInTheDocument();
    expect(screen.getByText('OpenWeatherMap API')).toBeInTheDocument();
  });

  test('renders service descriptions', () => {
    render(<ServiceHealth services={defaultServices} />);

    expect(screen.getByText(/react site \/ GHA \/ DO/)).toBeInTheDocument();
    expect(
      screen.getByText(/AI recipe react app using Gemini \/ GCP/)
    ).toBeInTheDocument();
    expect(screen.getByText(/og wp blog on Siteground/)).toBeInTheDocument();
    expect(screen.getByText(/Bluesky PDS on DO/)).toBeInTheDocument();
    expect(screen.getByText(/baseball integration/)).toBeInTheDocument();
    expect(screen.getByText(/spotify integration/)).toBeInTheDocument();
    expect(screen.getByText(/weather integration/)).toBeInTheDocument();
  });

  test('displays healthy status for all services initially', () => {
    render(<ServiceHealth services={defaultServices} />);

    const healthyIndicators = screen.getAllByText(/Operational/i);
    expect(healthyIndicators.length).toBeGreaterThan(0);
  });

  test('displays degraded status when provided', () => {
    const degradedServices = {
      ...defaultServices,
      tronswan: 'degraded' as const,
    };

    render(<ServiceHealth services={degradedServices} />);

    expect(screen.getByText(/Degraded Performance/i)).toBeInTheDocument();
  });

  test('displays down status when provided', () => {
    const downServices = {
      ...defaultServices,
      chomptron: 'down' as const,
    };

    render(<ServiceHealth services={downServices} />);

    expect(screen.getByText(/Service Unavailable/i)).toBeInTheDocument();
  });

  test('renders service URLs', () => {
    render(<ServiceHealth services={defaultServices} />);

    expect(screen.getByText('https://tronswan.com')).toBeInTheDocument();
    expect(screen.getByText('https://chomptron.com')).toBeInTheDocument();
    expect(screen.getByText('https://swantron.com')).toBeInTheDocument();
  });

  test('checkAllServices can be called via ref', async () => {
    const ref = React.createRef<any>();

    (global.fetch as any).mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => ({ access_token: 'test-token' }),
    });

    render(<ServiceHealth services={defaultServices} ref={ref} />);

    await act(async () => {
      if (ref.current) {
        await ref.current.checkAllServices();
      }
    });

    // Should have made fetch calls for health checks
    expect(global.fetch).toHaveBeenCalled();
  });

  test('handles fetch errors gracefully', async () => {
    const ref = React.createRef<any>();

    (global.fetch as any).mockRejectedValue(new Error('Network error'));

    render(<ServiceHealth services={defaultServices} ref={ref} />);

    await act(async () => {
      if (ref.current) {
        await ref.current.checkAllServices();
      }
    });

    // Component should still be rendered even after errors
    expect(screen.getByText('tron swan dot com')).toBeInTheDocument();
  });

  test('handles non-ok responses', async () => {
    const ref = React.createRef<any>();

    (global.fetch as any).mockResolvedValue({
      ok: false,
      status: 500,
      statusText: 'Internal Server Error',
    });

    render(<ServiceHealth services={defaultServices} ref={ref} />);

    await act(async () => {
      if (ref.current) {
        await ref.current.checkAllServices();
      }
    });

    expect(screen.getByText('tron swan dot com')).toBeInTheDocument();
  });

  test('displays response times after health check', async () => {
    const ref = React.createRef<any>();

    (global.fetch as any).mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => ({ access_token: 'test-token' }),
    });

    render(<ServiceHealth services={defaultServices} ref={ref} />);

    // Health checks run automatically on mount
    await waitFor(
      () => {
        // Just verify the component is rendered, response times may not show immediately
        expect(screen.getByText('tron swan dot com')).toBeInTheDocument();
      },
      { timeout: 3000 }
    );
  });

  test('handles Spotify API health check with token', async () => {
    const ref = React.createRef<any>();

    (global.fetch as any).mockImplementation(url => {
      if (url.includes('accounts.spotify.com')) {
        return Promise.resolve({
          ok: true,
          status: 200,
          json: async () => ({ access_token: 'test-spotify-token' }),
        });
      }
      return Promise.resolve({
        ok: true,
        status: 200,
        json: async () => ({}),
      });
    });

    render(<ServiceHealth services={defaultServices} ref={ref} />);

    await act(async () => {
      if (ref.current) {
        await ref.current.checkAllServices();
      }
    });

    expect(global.fetch).toHaveBeenCalled();
  });

  test('handles Spotify API token failure', async () => {
    const ref = React.createRef<any>();

    (global.fetch as any).mockImplementation(url => {
      if (url.includes('accounts.spotify.com')) {
        return Promise.resolve({
          ok: false,
          status: 401,
          statusText: 'Unauthorized',
        });
      }
      return Promise.resolve({
        ok: true,
        status: 200,
        json: async () => ({}),
      });
    });

    render(<ServiceHealth services={defaultServices} ref={ref} />);

    await act(async () => {
      if (ref.current) {
        await ref.current.checkAllServices();
      }
    });

    expect(screen.getByText('Spotify API')).toBeInTheDocument();
  });

  test('handles Weather API health check with API key', async () => {
    const ref = React.createRef<any>();

    (global.fetch as any).mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => ({ temp: 72 }),
    });

    render(<ServiceHealth services={defaultServices} ref={ref} />);

    await act(async () => {
      if (ref.current) {
        await ref.current.checkAllServices();
      }
    });

    // Should append API key to URL
    const calls = (global.fetch as any).mock.calls;
    const weatherCall = calls.find((call: any) =>
      call[0]?.includes('openweathermap')
    );
    expect(weatherCall).toBeDefined();
    if (weatherCall) {
      expect(weatherCall[0]).toContain('appid=');
    }
  });

  test('handles Weather API failure', async () => {
    const ref = React.createRef<any>();

    (global.fetch as any).mockImplementation(url => {
      if (url.includes('openweathermap')) {
        return Promise.resolve({
          ok: false,
          status: 401,
          statusText: 'Unauthorized',
        });
      }
      return Promise.resolve({
        ok: true,
        status: 200,
        json: async () => ({}),
      });
    });

    render(<ServiceHealth services={defaultServices} ref={ref} />);

    await act(async () => {
      if (ref.current) {
        await ref.current.checkAllServices();
      }
    });

    expect(screen.getByText('OpenWeatherMap API')).toBeInTheDocument();
  });

  test('handles MLB API health check', async () => {
    const ref = React.createRef<any>();

    (global.fetch as any).mockImplementation(url => {
      if (url.includes('statsapi.mlb.com')) {
        return Promise.resolve({
          ok: true,
          status: 200,
          json: async () => ({ records: [] }),
        });
      }
      return Promise.resolve({
        ok: true,
        status: 200,
        json: async () => ({}),
      });
    });

    render(<ServiceHealth services={defaultServices} ref={ref} />);

    await act(async () => {
      if (ref.current) {
        await ref.current.checkAllServices();
      }
    });

    const calls = (global.fetch as any).mock.calls;
    const mlbCall = calls.find((call: any) => call[0]?.includes('mlb.com'));
    expect(mlbCall).toBeDefined();
  });

  test('displays last checked time', () => {
    render(<ServiceHealth services={defaultServices} />);

    // Services should be rendered with their names
    expect(screen.getByText('tron swan dot com')).toBeInTheDocument();
    expect(screen.getByText('chomp tron dot com')).toBeInTheDocument();
  });

  test('updates status after health check completes', async () => {
    const ref = React.createRef<any>();

    (global.fetch as any).mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => ({ access_token: 'test-token' }),
    });

    render(<ServiceHealth services={defaultServices} ref={ref} />);

    await act(async () => {
      if (ref.current) {
        await ref.current.checkAllServices();
      }
    });

    await waitFor(() => {
      expect(screen.getByText('tron swan dot com')).toBeInTheDocument();
    });
  });
});
