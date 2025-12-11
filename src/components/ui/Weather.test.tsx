import {
  render,
  screen,
  waitFor,
  fireEvent,
  act,
} from '@testing-library/react';
import React from 'react';
import { HelmetProvider } from 'react-helmet-async';
import { describe, test, expect, beforeEach, vi } from 'vitest';

import '@testing-library/jest-dom';
import Weather from './Weather';

// Mock the runtime config
vi.mock('../utils/runtimeConfig', () => ({
  runtimeConfig: {
    initialize: vi.fn().mockResolvedValue(undefined),
    get: vi.fn().mockReturnValue('test-api-key'),
    getWithDefault: vi.fn().mockImplementation((key, defaultValue) => {
      if (key === 'VITE_WEATHER_CITY') return 'Bozeman';
      if (key === 'VITE_WEATHER_UNITS') return 'imperial';
      if (key === 'VITE_SITE_URL') return 'https://tronswan.com';
      if (key === 'VITE_WEATHER_API_KEY') return 'test-api-key';
      return defaultValue;
    }),
  },
}));

// Mock fetch globally
global.fetch = vi.fn();

// Helper function to render Weather component with HelmetProvider
const renderWeather = (props = {}) => {
  return render(
    <HelmetProvider>
      <Weather {...props} />
    </HelmetProvider>
  );
};

describe('Weather Component', () => {
  beforeEach(() => {
    (global.fetch as any).mockClear();
    // Mock both current weather and forecast API calls
    (global.fetch as any).mockImplementation(url => {
      if (url.includes('/weather?')) {
        // Current weather API
        return Promise.resolve({
          ok: true,
          json: async () => ({
            main: {
              temp: 72,
              feels_like: 70,
              pressure: 1013,
              humidity: 45,
            },
            name: 'Bozeman',
            sys: { country: 'US' },
          }),
        });
      } else if (url.includes('/forecast?')) {
        // Forecast API
        return Promise.resolve({
          ok: true,
          json: async () => ({
            list: [
              {
                dt: Date.now() / 1000,
                main: {
                  temp: 72,
                  feels_like: 70,
                  humidity: 45,
                  pressure: 1013,
                },
                weather: [
                  { main: 'Clear', description: 'clear sky', icon: '01d' },
                ],
                dt_txt: '2024-01-01 12:00:00',
              },
              {
                dt: Date.now() / 1000 + 86400,
                main: {
                  temp: 75,
                  feels_like: 73,
                  humidity: 50,
                  pressure: 1015,
                },
                weather: [
                  { main: 'Clouds', description: 'few clouds', icon: '02d' },
                ],
                dt_txt: '2024-01-02 12:00:00',
              },
            ],
            city: { name: 'Bozeman' },
          }),
        });
      }
      return Promise.reject(new Error('Unknown API endpoint'));
    });
  });

  test('renders weather page title', async () => {
    renderWeather();

    // Wait for the component to finish loading
    await waitFor(() => {
      expect(
        screen.queryByLabelText('Loading weather data')
      ).not.toBeInTheDocument();
    });

    expect(screen.getByTestId('weather-title')).toHaveTextContent(
      'weathertron'
    );
  });

  test('renders view toggle buttons', async () => {
    renderWeather();

    // Wait for the component to finish loading
    await waitFor(() => {
      expect(
        screen.queryByLabelText('Loading weather data')
      ).not.toBeInTheDocument();
    });

    expect(screen.getByText('Current')).toBeInTheDocument();
    expect(screen.getByText('Forecast')).toBeInTheDocument();
  });

  test('renders loading state initially', async () => {
    renderWeather();
    expect(screen.getByLabelText('Loading weather data')).toBeInTheDocument();

    // Wait for the component to finish loading
    await waitFor(() => {
      expect(
        screen.queryByLabelText('Loading weather data')
      ).not.toBeInTheDocument();
    });
  });

  test('renders weather info section', async () => {
    renderWeather();

    // Wait for the component to finish loading
    await waitFor(() => {
      expect(
        screen.queryByLabelText('Loading weather data')
      ).not.toBeInTheDocument();
    });

    expect(
      screen.getByText('Real-time weather data from OpenWeatherMap API')
    ).toBeInTheDocument();
    expect(
      screen.getByText(/Search by city name, city\/state combo, or zip code/)
    ).toBeInTheDocument();
  });

  test('renders city search input and button', async () => {
    renderWeather();

    // Wait for the component to finish loading
    await waitFor(() => {
      expect(
        screen.queryByLabelText('Loading weather data')
      ).not.toBeInTheDocument();
    });

    expect(screen.getByTestId('city-input')).toBeInTheDocument();
    expect(screen.getByTestId('search-button')).toBeInTheDocument();
  });

  test('handles missing weather data gracefully', async () => {
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

    (global.fetch as any).mockImplementation(url => {
      if (url.includes('/weather?')) {
        return Promise.resolve({
          ok: true,
          json: async () => mockWeatherData,
        });
      } else if (url.includes('/forecast?')) {
        return Promise.resolve({
          ok: true,
          json: async () => ({ list: [], city: { name: 'Bozeman' } }),
        });
      }
      return Promise.reject(new Error('Unknown API endpoint'));
    });

    renderWeather();

    await waitFor(() => {
      expect(screen.getByTestId('weather-display')).toBeInTheDocument();
    });
  });

  test('disables search button when input is empty', async () => {
    renderWeather();

    // Wait for the component to finish loading
    await waitFor(() => {
      expect(
        screen.queryByLabelText('Loading weather data')
      ).not.toBeInTheDocument();
    });

    const searchButton = screen.getByTestId('search-button');
    expect(searchButton).toBeDisabled();
  });

  test('enables search button when input has text', async () => {
    renderWeather();
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
    renderWeather();

    await waitFor(() => {
      expect(
        screen.getByText((content, element) => {
          return element?.textContent === 'Currently showing: Bozeman';
        })
      ).toBeInTheDocument();
    });
  });

  test('WeatherDisplay component renders correctly with props', () => {
    const mockWeather = {
      temperature: 72,
      feelsLike: 70,
      pressure: 1013,
      humidity: 45,
      city: 'Bozeman',
      country: 'US',
    };

    renderWeather();

    // Wait for data to load and check if weather display is present
    waitFor(() => {
      expect(screen.getByTestId('weather-display')).toBeInTheDocument();
    });
  });

  test('displays weather data correctly after loading', async () => {
    renderWeather();

    await waitFor(() => {
      expect(screen.getByTestId('temperature-display')).toHaveTextContent(
        '72°F'
      );
      expect(screen.getByTestId('feels-like-display')).toHaveTextContent(
        '70°F'
      );
      expect(screen.getByTestId('pressure-display')).toHaveTextContent(
        '1013 hPa'
      );
      expect(screen.getByTestId('humidity-display')).toHaveTextContent('45%');
      expect(screen.getByTestId('location-display')).toHaveTextContent(
        '📍 Bozeman, US'
      );
    });
  });

  test('handles search with empty input gracefully', async () => {
    renderWeather();
    const cityInput = screen.getByTestId('city-input');
    const searchButton = screen.getByTestId('search-button');

    // Search button should be disabled for empty input
    expect(searchButton).toBeDisabled();

    await act(async () => {
      fireEvent.change(cityInput, { target: { value: '   ' } });
    });

    // Search button should still be disabled for whitespace-only input
    expect(searchButton).toBeDisabled();
  });

  // Temperature unit tests
  test('renders temperature unit toggle buttons', async () => {
    renderWeather();

    // Wait for the component to finish loading
    await waitFor(() => {
      expect(
        screen.queryByLabelText('Loading weather data')
      ).not.toBeInTheDocument();
    });

    expect(screen.getByText('°F')).toBeInTheDocument();
    expect(screen.getByText('°C')).toBeInTheDocument();
    expect(screen.getByText('K')).toBeInTheDocument();
  });

  test('shows imperial as active by default', async () => {
    renderWeather();

    // Wait for the component to finish loading
    await waitFor(() => {
      expect(
        screen.queryByLabelText('Loading weather data')
      ).not.toBeInTheDocument();
    });

    const fahrenheitButton = screen.getByText('°F');
    const celsiusButton = screen.getByText('°C');
    const kelvinButton = screen.getByText('K');

    expect(fahrenheitButton).toHaveClass('active');
    expect(celsiusButton).not.toHaveClass('active');
    expect(kelvinButton).not.toHaveClass('active');
  });

  test('unit buttons are clickable', async () => {
    renderWeather();

    // Wait for the component to finish loading
    await waitFor(() => {
      expect(
        screen.queryByLabelText('Loading weather data')
      ).not.toBeInTheDocument();
    });

    const fahrenheitButton = screen.getByText('°F');
    const celsiusButton = screen.getByText('°C');
    const kelvinButton = screen.getByText('K');

    // Buttons should be present and clickable
    expect(fahrenheitButton).toBeInTheDocument();
    expect(celsiusButton).toBeInTheDocument();
    expect(kelvinButton).toBeInTheDocument();

    // Buttons should have the correct classes
    expect(fahrenheitButton).toHaveClass('unit-button');
    expect(celsiusButton).toHaveClass('unit-button');
    expect(kelvinButton).toHaveClass('unit-button');
  });

  test('switches to forecast view', async () => {
    renderWeather();

    await waitFor(() => {
      expect(
        screen.queryByLabelText('Loading weather data')
      ).not.toBeInTheDocument();
    });

    const forecastButton = screen.getByText('Forecast');
    await act(async () => {
      fireEvent.click(forecastButton);
    });

    await waitFor(() => {
      expect(screen.getByText('5-Day Forecast')).toBeInTheDocument();
    });
  });

  test('switches back to current view', async () => {
    renderWeather();

    await waitFor(() => {
      expect(
        screen.queryByLabelText('Loading weather data')
      ).not.toBeInTheDocument();
    });

    // Switch to forecast
    const forecastButton = screen.getByText('Forecast');
    await act(async () => {
      fireEvent.click(forecastButton);
    });

    // Switch back to current
    const currentButton = screen.getByText('Current');
    await act(async () => {
      fireEvent.click(currentButton);
    });

    await waitFor(() => {
      expect(screen.getByTestId('weather-display')).toBeInTheDocument();
    });
  });

  test('handles API error gracefully', async () => {
    (global.fetch as any).mockRejectedValue(new Error('API Error'));

    renderWeather();

    await waitFor(() => {
      expect(
        screen.queryByLabelText('Loading weather data')
      ).not.toBeInTheDocument();
    });

    expect(screen.getByText(/error/i)).toBeInTheDocument();
  });

  test('handles 404 location not found', async () => {
    (global.fetch as any).mockResolvedValue({
      ok: false,
      status: 404,
      statusText: 'Not Found',
    });

    renderWeather();

    await waitFor(() => {
      expect(
        screen.queryByLabelText('Loading weather data')
      ).not.toBeInTheDocument();
    });

    // Check for error message specifically (not the info text)
    const errorMessage = screen.getByText(/location not found/i);
    expect(errorMessage).toBeInTheDocument();
    expect(errorMessage.textContent).toMatch(/Try: city name/);
  });

  test('performs search when button is clicked', async () => {
    renderWeather();

    await waitFor(() => {
      expect(
        screen.queryByLabelText('Loading weather data')
      ).not.toBeInTheDocument();
    });

    const cityInput = screen.getByTestId('city-input');
    const searchButton = screen.getByTestId('search-button');

    (global.fetch as any).mockClear();
    (global.fetch as any).mockImplementation(url => {
      if (url.includes('/weather?')) {
        return Promise.resolve({
          ok: true,
          json: async () => ({
            main: {
              temp: 60,
              feels_like: 58,
              pressure: 1015,
              humidity: 50,
              temp_min: 55,
              temp_max: 65,
            },
            weather: [{ description: 'cloudy' }],
            wind: { speed: 10, deg: 180 },
            visibility: 16093,
            clouds: { all: 75 },
            sys: { sunrise: 1609459200, sunset: 1609495200, country: 'GB' },
            name: 'London',
          }),
        });
      } else if (url.includes('/forecast?')) {
        return Promise.resolve({
          ok: true,
          json: async () => ({
            list: [],
            city: { name: 'London' },
          }),
        });
      }
      return Promise.reject(new Error('Unknown API endpoint'));
    });

    await act(async () => {
      fireEvent.change(cityInput, { target: { value: 'London' } });
    });

    await act(async () => {
      fireEvent.click(searchButton);
    });

    await waitFor(() => {
      expect(screen.getByTestId('location-display')).toHaveTextContent(
        'London'
      );
    });
  });

  test('displays all weather details when available', async () => {
    (global.fetch as any).mockImplementation(url => {
      if (url.includes('/weather?')) {
        return Promise.resolve({
          ok: true,
          json: async () => ({
            main: {
              temp: 72,
              feels_like: 70,
              pressure: 1013,
              humidity: 45,
              temp_min: 68,
              temp_max: 76,
            },
            weather: [{ description: 'clear sky' }],
            wind: { speed: 10, deg: 180 },
            visibility: 16093,
            clouds: { all: 10 },
            sys: { sunrise: 1609459200, sunset: 1609495200, country: 'US' },
            name: 'Bozeman',
          }),
        });
      } else if (url.includes('/forecast?')) {
        return Promise.resolve({
          ok: true,
          json: async () => ({
            list: [],
            city: { name: 'Bozeman' },
          }),
        });
      }
      return Promise.reject(new Error('Unknown API endpoint'));
    });

    renderWeather();

    await waitFor(() => {
      expect(
        screen.getByTestId('weather-description-display')
      ).toHaveTextContent('clear sky');
      expect(screen.getByTestId('temp-range-display')).toBeInTheDocument();
      expect(screen.getByTestId('clouds-display')).toHaveTextContent('10%');
      expect(screen.getByTestId('wind-display')).toBeInTheDocument();
      expect(screen.getByTestId('visibility-display')).toBeInTheDocument();
      expect(screen.getByTestId('sunrise-display')).toBeInTheDocument();
      expect(screen.getByTestId('sunset-display')).toBeInTheDocument();
    });
  });

  test('switches to Celsius temperature unit', async () => {
    renderWeather();

    await waitFor(() => {
      expect(
        screen.queryByLabelText('Loading weather data')
      ).not.toBeInTheDocument();
    });

    const celsiusButton = screen.getByText('°C');
    await act(async () => {
      fireEvent.click(celsiusButton);
    });

    await waitFor(() => {
      expect(celsiusButton).toHaveClass('active');
    });
  });

  test('switches to Kelvin temperature unit', async () => {
    renderWeather();

    await waitFor(() => {
      expect(
        screen.queryByLabelText('Loading weather data')
      ).not.toBeInTheDocument();
    });

    const kelvinButton = screen.getByText('K');
    await act(async () => {
      fireEvent.click(kelvinButton);
    });

    await waitFor(() => {
      expect(kelvinButton).toHaveClass('active');
    });
  });

  test('renders forecast with multiple days', async () => {
    (global.fetch as any).mockImplementation(url => {
      if (url.includes('/weather?')) {
        return Promise.resolve({
          ok: true,
          json: async () => ({
            main: { temp: 72, feels_like: 70, pressure: 1013, humidity: 45 },
            name: 'Bozeman',
            sys: { country: 'US' },
          }),
        });
      } else if (url.includes('/forecast?')) {
        return Promise.resolve({
          ok: true,
          json: async () => ({
            list: [
              {
                dt: Date.now() / 1000,
                main: {
                  temp: 72,
                  feels_like: 70,
                  humidity: 45,
                  pressure: 1013,
                },
                weather: [
                  { main: 'Clear', description: 'clear sky', icon: '01d' },
                ],
                dt_txt: '2024-01-01 12:00:00',
              },
              {
                dt: Date.now() / 1000 + 86400,
                main: {
                  temp: 75,
                  feels_like: 73,
                  humidity: 50,
                  pressure: 1015,
                },
                weather: [
                  { main: 'Clouds', description: 'few clouds', icon: '02d' },
                ],
                dt_txt: '2024-01-02 12:00:00',
              },
              {
                dt: Date.now() / 1000 + 172800,
                main: {
                  temp: 68,
                  feels_like: 66,
                  humidity: 55,
                  pressure: 1012,
                },
                weather: [
                  { main: 'Rain', description: 'light rain', icon: '10d' },
                ],
                dt_txt: '2024-01-03 12:00:00',
              },
            ],
            city: { name: 'Bozeman' },
          }),
        });
      }
      return Promise.reject(new Error('Unknown API endpoint'));
    });

    renderWeather();

    await waitFor(() => {
      expect(
        screen.queryByLabelText('Loading weather data')
      ).not.toBeInTheDocument();
    });

    const forecastButton = screen.getByText('Forecast');
    await act(async () => {
      fireEvent.click(forecastButton);
    });

    await waitFor(() => {
      expect(screen.getByText('5-Day Forecast')).toBeInTheDocument();
    });
  });

  test('clears city input after successful search', async () => {
    renderWeather();

    await waitFor(() => {
      expect(
        screen.queryByLabelText('Loading weather data')
      ).not.toBeInTheDocument();
    });

    const cityInput = screen.getByTestId('city-input') as HTMLInputElement;
    const searchButton = screen.getByTestId('search-button');

    await act(async () => {
      fireEvent.change(cityInput, { target: { value: 'Paris' } });
    });

    expect(cityInput.value).toBe('Paris');

    await act(async () => {
      fireEvent.click(searchButton);
    });

    await waitFor(() => {
      expect(cityInput.value).toBe('');
    });
  });

  test('handles zip code search', async () => {
    renderWeather();

    await waitFor(() => {
      expect(
        screen.queryByLabelText('Loading weather data')
      ).not.toBeInTheDocument();
    });

    const cityInput = screen.getByTestId('city-input');
    const searchButton = screen.getByTestId('search-button');

    (global.fetch as any).mockClear();
    (global.fetch as any).mockImplementation(url => {
      // Check that zip code is normalized with ",us" appended
      // URL encoding might have %2C for comma
      if (
        url.includes('/weather?') &&
        (url.includes('59715,us') || url.includes('59715%2Cus'))
      ) {
        return Promise.resolve({
          ok: true,
          json: async () => ({
            main: {
              temp: 65,
              feels_like: 63,
              pressure: 1013,
              humidity: 45,
            },
            weather: [{ description: 'clear sky' }],
            sys: { country: 'US' },
            name: 'Bozeman',
          }),
        });
      } else if (
        url.includes('/forecast?') &&
        (url.includes('59715,us') || url.includes('59715%2Cus'))
      ) {
        return Promise.resolve({
          ok: true,
          json: async () => ({
            list: [],
            city: { name: 'Bozeman' },
          }),
        });
      }
      return Promise.reject(new Error('Unknown API endpoint'));
    });

    await act(async () => {
      fireEvent.change(cityInput, { target: { value: '59715' } });
    });

    await act(async () => {
      fireEvent.click(searchButton);
    });

    await waitFor(() => {
      expect(screen.getByTestId('location-display')).toHaveTextContent(
        'Bozeman'
      );
    });
  });

  test('handles city/state combo search', async () => {
    renderWeather();

    await waitFor(() => {
      expect(
        screen.queryByLabelText('Loading weather data')
      ).not.toBeInTheDocument();
    });

    const cityInput = screen.getByTestId('city-input');
    const searchButton = screen.getByTestId('search-button');

    (global.fetch as any).mockClear();
    (global.fetch as any).mockImplementation(url => {
      // Check that city/state combo is normalized to "city,state,us" format
      // URL encoding might have %2C for comma, %20 for space
      const isWeatherCall = url.includes('/weather?');
      const isForecastCall = url.includes('/forecast?');
      // Should be normalized to "Bozeman,MT,us" format
      const hasBozemanMTUS =
        (url.includes('Bozeman') && url.includes('MT') && url.includes('us')) ||
        url.includes('Bozeman%2CMT%2Cus') ||
        url.includes('Bozeman,MT,us');

      if (isWeatherCall && hasBozemanMTUS) {
        return Promise.resolve({
          ok: true,
          json: async () => ({
            main: {
              temp: 70,
              feels_like: 68,
              pressure: 1013,
              humidity: 45,
            },
            weather: [{ description: 'sunny' }],
            sys: { country: 'US' },
            name: 'Bozeman',
          }),
        });
      } else if (isForecastCall && hasBozemanMTUS) {
        return Promise.resolve({
          ok: true,
          json: async () => ({
            list: [],
            city: { name: 'Bozeman' },
          }),
        });
      }
      return Promise.reject(new Error('Unknown API endpoint'));
    });

    await act(async () => {
      fireEvent.change(cityInput, { target: { value: 'Bozeman, MT' } });
    });

    await act(async () => {
      fireEvent.click(searchButton);
    });

    await waitFor(() => {
      expect(screen.getByTestId('location-display')).toHaveTextContent(
        'Bozeman'
      );
    });
  });

  test('handles zip code with country code', async () => {
    renderWeather();

    await waitFor(() => {
      expect(
        screen.queryByLabelText('Loading weather data')
      ).not.toBeInTheDocument();
    });

    const cityInput = screen.getByTestId('city-input');
    const searchButton = screen.getByTestId('search-button');

    (global.fetch as any).mockClear();
    (global.fetch as any).mockImplementation(url => {
      // Check that zip code with country code is passed as-is
      // URL encoding might have %2C for comma
      if (
        url.includes('/weather?') &&
        (url.includes('10001,us') || url.includes('10001%2Cus'))
      ) {
        return Promise.resolve({
          ok: true,
          json: async () => ({
            main: {
              temp: 75,
              feels_like: 73,
              pressure: 1015,
              humidity: 50,
            },
            weather: [{ description: 'partly cloudy' }],
            sys: { country: 'US' },
            name: 'New York',
          }),
        });
      } else if (
        url.includes('/forecast?') &&
        (url.includes('10001,us') || url.includes('10001%2Cus'))
      ) {
        return Promise.resolve({
          ok: true,
          json: async () => ({
            list: [],
            city: { name: 'New York' },
          }),
        });
      }
      return Promise.reject(new Error('Unknown API endpoint'));
    });

    await act(async () => {
      fireEvent.change(cityInput, { target: { value: '10001,us' } });
    });

    await act(async () => {
      fireEvent.click(searchButton);
    });

    await waitFor(() => {
      expect(screen.getByTestId('location-display')).toHaveTextContent(
        'New York'
      );
    });
  });
});
