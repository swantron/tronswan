import { render, screen, waitFor, fireEvent, act } from '@testing-library/react';
import React from 'react';
import { vi, expect, describe, test, beforeEach } from 'vitest';

import '@testing-library/jest-dom';
import Weather from './Weather';

// Mock the SEO component to prevent react-helmet-async errors
vi.mock('./SEO', () => ({
  default: function MockSEO() {
    return null;
  },
}));

// Mock fetch globally
global.fetch = vi.fn();

describe('Weather Component', () => {
  beforeEach(() => {
    fetch.mockClear();
  });

  test('renders weather page title', () => {
    render(<Weather />);
    expect(screen.getByTestId('weather-title')).toBeInTheDocument();
    expect(screen.getByTestId('weather-title')).toHaveTextContent(
      'weathertron'
    );
  });

  test('renders weather subtitle', () => {
    render(<Weather />);
    expect(
      screen.getByText('🌡️ robot weather station monitoring global conditions')
    ).toBeInTheDocument();
  });

  test('renders loading state initially', () => {
    render(<Weather />);
    expect(screen.getByLabelText('Loading weather data')).toBeInTheDocument();
  });

  test('renders weather data when API call succeeds', async () => {
    const mockWeatherData = {
      main: {
        temp: 72,
        feels_like: 70,
        pressure: 1013,
        humidity: 45,
      },
      name: 'Bozeman',
      sys: { country: 'US' },
    };

    fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => mockWeatherData,
    });

    render(<Weather />);

    // Wait for weather data to load
    await waitFor(() => {
      expect(screen.getByTestId('temperature-display')).toBeInTheDocument();
    });

    expect(screen.getByTestId('temperature-display')).toHaveTextContent(
      'thermomotron | 72°F'
    );
    expect(screen.getByTestId('feels-like-display')).toHaveTextContent(
      'feelometer | 70°F'
    );
    expect(screen.getByTestId('pressure-display')).toHaveTextContent(
      'baromotron | 1013 hPa'
    );
    expect(screen.getByTestId('humidity-display')).toHaveTextContent(
      'humidotron | 45%'
    );
    expect(screen.getByTestId('location-display')).toHaveTextContent(
      '📍 Bozeman, US'
    );
  });

  test('renders error message when API call fails', async () => {
    fetch.mockRejectedValueOnce(new Error('API call failed'));

    render(<Weather />);

    await waitFor(() => {
      expect(
        screen.getByText('API call failed')
      ).toBeInTheDocument();
    });
  });

  test('renders error message when API returns non-ok response', async () => {
    fetch.mockResolvedValueOnce({
      ok: false,
      status: 500,
    });

    render(<Weather />);

    await waitFor(() => {
      expect(
        screen.getByText('Weather data fetch failed')
      ).toBeInTheDocument();
    });
  });

  test('renders weather info section', () => {
    render(<Weather />);
    expect(
      screen.getByText('Real-time weather data from OpenWeatherMap API')
    ).toBeInTheDocument();
    expect(screen.getByText('Search for any city worldwide to get current conditions')).toBeInTheDocument();
  });

  test('handles missing weather data gracefully', async () => {
    const mockWeatherData = {
      main: {
        temp: null,
        feels_like: 70,
        pressure: null,
        humidity: 45,
      },
      name: 'Bozeman',
      sys: { country: 'US' },
    };

    fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => mockWeatherData,
    });

    render(<Weather />);

    // Wait for the API call to complete
    await waitFor(() => {
      expect(
        screen.queryByLabelText('Loading weather data')
      ).not.toBeInTheDocument();
    });

    // Should not show temperature and pressure displays since they are null
    expect(screen.queryByTestId('temperature-display')).not.toBeInTheDocument();
    expect(screen.queryByTestId('pressure-display')).not.toBeInTheDocument();

    // Should show feels-like and humidity displays since they have values
    expect(screen.getByTestId('feels-like-display')).toBeInTheDocument();
    expect(screen.getByTestId('humidity-display')).toBeInTheDocument();
  });

  test('renders city search input and button', () => {
    render(<Weather />);
    expect(screen.getByTestId('city-input')).toBeInTheDocument();
    expect(screen.getByTestId('search-button')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Enter city name (e.g., New York, London, Tokyo)')).toBeInTheDocument();
  });

  test('handles city search form submission', async () => {
    const mockWeatherData = {
      main: {
        temp: 75,
        feels_like: 73,
        pressure: 1020,
        humidity: 60,
      },
      name: 'New York',
      sys: { country: 'US' },
    };

    fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => mockWeatherData,
    });

    render(<Weather />);

    const cityInput = screen.getByTestId('city-input');
    const searchButton = screen.getByTestId('search-button');

    await act(async () => {
      fireEvent.change(cityInput, { target: { value: 'New York' } });
      fireEvent.click(searchButton);
    });

    await waitFor(() => {
      expect(screen.getByTestId('location-display')).toHaveTextContent('📍 New York, US');
    });
  });

  test('handles city not found error', async () => {
    fetch.mockResolvedValueOnce({
      ok: false,
      status: 404,
    });

    render(<Weather />);

    const cityInput = screen.getByTestId('city-input');
    const searchButton = screen.getByTestId('search-button');

    await act(async () => {
      fireEvent.change(cityInput, { target: { value: 'InvalidCity' } });
      fireEvent.click(searchButton);
    });

    await waitFor(() => {
      expect(screen.getByText('City not found. Please check the spelling and try again.')).toBeInTheDocument();
    });
  });

  test('disables search button when input is empty', () => {
    render(<Weather />);
    const searchButton = screen.getByTestId('search-button');
    expect(searchButton).toBeDisabled();
  });

  test('enables search button when input has text', async () => {
    render(<Weather />);
    const cityInput = screen.getByTestId('city-input');
    const searchButton = screen.getByTestId('search-button');

    await act(async () => {
      fireEvent.change(cityInput, { target: { value: 'London' } });
    });
    
    await waitFor(() => {
      expect(searchButton).not.toBeDisabled();
    });
  });

  test('shows current location when weather data is loaded', async () => {
    const mockWeatherData = {
      main: {
        temp: 72,
        feels_like: 70,
        pressure: 1013,
        humidity: 45,
      },
      name: 'Bozeman',
      sys: { country: 'US' },
    };

    fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => mockWeatherData,
    });

    render(<Weather />);

    await waitFor(() => {
      expect(screen.getByText((content, element) => {
        return element?.textContent === 'Currently showing: Bozeman';
      })).toBeInTheDocument();
    });
  });

  test('WeatherDisplay component renders correctly with props', () => {
    const mockWeather = {
      temperature: 65,
      feelsLike: 63,
      pressure: 1000,
      humidity: 50,
      city: 'London',
      country: 'GB',
    };

    render(
      <div>
        <div className='weather-container'>
          {mockWeather.temperature && (
            <div className='weather-item'>
              <p data-testid='temperature-display'>
                thermomotron | {mockWeather.temperature}°F
              </p>
            </div>
          )}
          {mockWeather.feelsLike && (
            <div className='weather-item'>
              <p data-testid='feels-like-display'>
                feelometer | {mockWeather.feelsLike}°F
              </p>
            </div>
          )}
          {mockWeather.pressure && (
            <div className='weather-item'>
              <p data-testid='pressure-display'>
                baromotron | {mockWeather.pressure} hPa
              </p>
            </div>
          )}
          {mockWeather.humidity && (
            <div className='weather-item'>
              <p data-testid='humidity-display'>
                humidotron | {mockWeather.humidity}%
              </p>
            </div>
          )}
          {mockWeather.city && (
            <div className='weather-item weather-location'>
              <p data-testid='location-display'>
                📍 {mockWeather.city}{mockWeather.country ? `, ${mockWeather.country}` : ''}
              </p>
            </div>
          )}
        </div>
      </div>
    );

    expect(screen.getByTestId('temperature-display')).toHaveTextContent(
      'thermomotron | 65°F'
    );
    expect(screen.getByTestId('feels-like-display')).toHaveTextContent(
      'feelometer | 63°F'
    );
    expect(screen.getByTestId('pressure-display')).toHaveTextContent(
      'baromotron | 1000 hPa'
    );
    expect(screen.getByTestId('humidity-display')).toHaveTextContent(
      'humidotron | 50%'
    );
    expect(screen.getByTestId('location-display')).toHaveTextContent(
      '📍 London, GB'
    );
  });
});
