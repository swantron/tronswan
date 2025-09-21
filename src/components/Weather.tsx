import React, { useState, useEffect } from 'react';

import { runtimeConfig } from '../utils/runtimeConfig';

import SEO from './SEO';
import '../styles/Weather.css';

interface WeatherData {
  temperature: number | null;
  feelsLike: number | null;
  pressure: number | null;
  humidity: number | null;
  city: string | null;
  country: string | null;
}

interface WeatherDisplayProps {
  weather: WeatherData;
}

function WeatherDisplay({ weather }: WeatherDisplayProps) {
  return (
    <div className='weather-container'>
      {weather.temperature && (
        <div className='weather-item'>
          <p data-testid='temperature-display'>
            thermomotron | {weather.temperature}°F
          </p>
        </div>
      )}
      {weather.feelsLike && (
        <div className='weather-item'>
          <p data-testid='feels-like-display'>
            feelometer | {weather.feelsLike}°F
          </p>
        </div>
      )}
      {weather.pressure && (
        <div className='weather-item'>
          <p data-testid='pressure-display'>
            baromotron | {weather.pressure} hPa
          </p>
        </div>
      )}
      {weather.humidity && (
        <div className='weather-item'>
          <p data-testid='humidity-display'>humidotron | {weather.humidity}%</p>
        </div>
      )}
      {weather.city && (
        <div className='weather-item weather-location'>
          <p data-testid='location-display'>
            📍 {weather.city}{weather.country ? `, ${weather.country}` : ''}
          </p>
        </div>
      )}
    </div>
  );
}

function Weather() {
  const [weather, setWeather] = useState<WeatherData>({
    temperature: null,
    feelsLike: null,
    pressure: null,
    humidity: null,
    city: null,
    country: null,
  });
  const [loading, setLoading] = useState<boolean>(true);
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [cityInput, setCityInput] = useState<string>('');
  const [currentCity, setCurrentCity] = useState<string>('');

  const fetchWeatherData = async (city: string) => {
    setLoading(true);
    setErrorMessage('');

    try {
      // Initialize runtime config if not already done
      await runtimeConfig.initialize();

      const apiKey = runtimeConfig.get('VITE_WEATHER_API_KEY');
      const units = runtimeConfig.getWithDefault(
        'VITE_WEATHER_UNITS',
        'imperial'
      );
      const url = `https://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(city)}&appid=${apiKey}&units=${units}`;

      const response = await fetch(url);
      if (!response.ok) {
        if (response.status === 404) {
          throw new Error('City not found. Please check the spelling and try again.');
        }
        throw new Error('Weather data fetch failed');
      }
      const data = await response.json();
      setWeather({
        temperature: data.main.temp,
        feelsLike: data.main.feels_like,
        pressure: data.main.pressure,
        humidity: data.main.humidity,
        city: data.name,
        country: data.sys.country,
      });
      setCurrentCity(data.name);
    } catch (error) {
      console.error('Error fetching weather data:', error);
      setErrorMessage(
        error instanceof Error ? error.message : 'api call to openweathermap failed.. check the console'
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Initialize runtime config and get default city
    const initializeWeather = async () => {
      await runtimeConfig.initialize();
      const defaultCity = runtimeConfig.getWithDefault('VITE_WEATHER_CITY', 'Bozeman');
      setCurrentCity(defaultCity);
      await fetchWeatherData(defaultCity);
    };

    initializeWeather();
  }, []);

  const handleCitySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (cityInput.trim()) {
      await fetchWeatherData(cityInput.trim());
      setCityInput('');
    }
  };

  const handleCityChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setCityInput(e.target.value);
  };

  return (
    <div className='weather-page'>
      <SEO
        title='Weather Station - Tron Swan'
        description='Check the current weather conditions anywhere in the world with our robot weather station featuring thermomotron, feelometer, baromotron, and humidotron readings.'
        keywords='weather, temperature, humidity, pressure, robot weather station, global weather'
        url='/weather'
      />

      <div className='weather-content'>
        <h1 className='weather-title' data-testid='weather-title'>
          weathertron
        </h1>

        <div className='weather-search'>
          <form onSubmit={handleCitySubmit} className='city-search-form'>
            <div className='search-input-group'>
              <input
                type='text'
                value={cityInput}
                onChange={handleCityChange}
                placeholder='Enter city name (e.g., New York, London, Tokyo)'
                className='city-input'
                data-testid='city-input'
                disabled={loading}
              />
              <button 
                type='submit' 
                className='search-button'
                disabled={loading || !cityInput.trim()}
                data-testid='search-button'
              >
                {loading ? '⏳' : '🔍'}
              </button>
            </div>
          </form>
          
          {currentCity && (
            <p className='current-location'>
              Currently showing: <strong>{currentCity}</strong>
            </p>
          )}
        </div>

        {loading ? (
          <div className='loading-spinner' aria-label='Loading weather data' />
        ) : errorMessage ? (
          <div className='error-message'>{errorMessage}</div>
        ) : (
          <WeatherDisplay weather={weather} />
        )}

        <div className='weather-info'>
          <p>Real-time weather data from OpenWeatherMap API</p>
          <p>Search for any city worldwide to get current conditions</p>
        </div>
      </div>
    </div>
  );
}

export default Weather;
