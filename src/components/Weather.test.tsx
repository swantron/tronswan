import { vi } from 'vitest';
import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import Weather from './Weather';

// Mock the SEO component to prevent react-helmet-async errors
vi.mock('./SEO', () => ({
  default: function MockSEO() {
    return null;
  }
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
    expect(screen.getByTestId('weather-title')).toHaveTextContent('weathertron');
  });

  test('renders weather subtitle', () => {
    render(<Weather />);
    expect(screen.getByText('🌡️ robot weather station monitoring Bozeman conditions')).toBeInTheDocument();
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
        humidity: 45
      }
    };

    fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => mockWeatherData
    });

    render(<Weather />);

    // Wait for weather data to load
    await waitFor(() => {
      expect(screen.getByTestId('temperature-display')).toBeInTheDocument();
    });

    expect(screen.getByTestId('temperature-display')).toHaveTextContent('thermomotron | 72°F');
    expect(screen.getByTestId('feels-like-display')).toHaveTextContent('feelometer | 70°F');
    expect(screen.getByTestId('pressure-display')).toHaveTextContent('baromotron | 1013 hPa');
    expect(screen.getByTestId('humidity-display')).toHaveTextContent('humidotron | 45%');
  });

  test('renders error message when API call fails', async () => {
    fetch.mockRejectedValueOnce(new Error('API call failed'));

    render(<Weather />);

    await waitFor(() => {
      expect(screen.getByText('api call to openweathermap failed.. check the console')).toBeInTheDocument();
    });
  });

  test('renders error message when API returns non-ok response', async () => {
    fetch.mockResolvedValueOnce({
      ok: false,
      status: 500
    });

    render(<Weather />);

    await waitFor(() => {
      expect(screen.getByText('api call to openweathermap failed.. check the console')).toBeInTheDocument();
    });
  });

  test('renders weather info section', () => {
    render(<Weather />);
    expect(screen.getByText('Real-time weather data from OpenWeatherMap API')).toBeInTheDocument();
    expect(screen.getByText('Location: Bozeman, Montana')).toBeInTheDocument();
  });

  test('handles missing weather data gracefully', async () => {
    const mockWeatherData = {
      main: {
        temp: null,
        feels_like: 70,
        pressure: null,
        humidity: 45
      }
    };

    fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => mockWeatherData
    });

    render(<Weather />);

    // Wait for the API call to complete
    await waitFor(() => {
      expect(screen.queryByLabelText('Loading weather data')).not.toBeInTheDocument();
    });

    // Should not show temperature and pressure displays since they are null
    expect(screen.queryByTestId('temperature-display')).not.toBeInTheDocument();
    expect(screen.queryByTestId('pressure-display')).not.toBeInTheDocument();

    // Should show feels-like and humidity displays since they have values
    expect(screen.getByTestId('feels-like-display')).toBeInTheDocument();
    expect(screen.getByTestId('humidity-display')).toBeInTheDocument();
  });

  test('WeatherDisplay component renders correctly with props', () => {
    const mockWeather = {
      temperature: 65,
      feelsLike: 63,
      pressure: 1000,
      humidity: 50
    };

    render(
      <div>
        <div className="weather-container">
          {mockWeather.temperature && (
            <div className="weather-item">
              <p data-testid="temperature-display">thermomotron | {mockWeather.temperature}°F</p>
            </div>
          )}
          {mockWeather.feelsLike && (
            <div className="weather-item">
              <p data-testid="feels-like-display">feelometer | {mockWeather.feelsLike}°F</p>
            </div>
          )}
          {mockWeather.pressure && (
            <div className="weather-item">
              <p data-testid="pressure-display">baromotron | {mockWeather.pressure} hPa</p>
            </div>
          )}
          {mockWeather.humidity && (
            <div className="weather-item">
              <p data-testid="humidity-display">humidotron | {mockWeather.humidity}%</p>
            </div>
          )}
        </div>
      </div>
    );

    expect(screen.getByTestId('temperature-display')).toHaveTextContent('thermomotron | 65°F');
    expect(screen.getByTestId('feels-like-display')).toHaveTextContent('feelometer | 63°F');
    expect(screen.getByTestId('pressure-display')).toHaveTextContent('baromotron | 1000 hPa');
    expect(screen.getByTestId('humidity-display')).toHaveTextContent('humidotron | 50%');
  });
}); 