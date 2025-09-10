import React, { useState, useEffect } from 'react';
import SEO from './SEO';
import '../styles/Weather.css';

interface WeatherData {
  temperature: number | null;
  feelsLike: number | null;
  pressure: number | null;
  humidity: number | null;
}

interface WeatherDisplayProps {
  weather: WeatherData;
}

function WeatherDisplay({ weather }: WeatherDisplayProps) {
  return (
    <div className="weather-container">
      {weather.temperature && (
        <div className="weather-item">
          <p data-testid="temperature-display">thermomotron | {weather.temperature}°F</p>
        </div>
      )}
      {weather.feelsLike && (
        <div className="weather-item">
          <p data-testid="feels-like-display">feelometer | {weather.feelsLike}°F</p>
        </div>
      )}
      {weather.pressure && (
        <div className="weather-item">
          <p data-testid="pressure-display">baromotron | {weather.pressure} hPa</p>
        </div>
      )}
      {weather.humidity && (
        <div className="weather-item">
          <p data-testid="humidity-display">humidotron | {weather.humidity}%</p>
        </div>
      )}
    </div>
  );
}

function Weather() {
  const [weather, setWeather] = useState<WeatherData>({ temperature: null, feelsLike: null, pressure: null, humidity: null });
  const [loading, setLoading] = useState<boolean>(true);
  const [errorMessage, setErrorMessage] = useState<string>('');

  useEffect(() => {
    async function fetchWeatherData() {
      const apiKey = import.meta.env.VITE_API_KEY;
      const city = import.meta.env.VITE_CITY || 'Bozeman';
      const units = import.meta.env.VITE_UNITS || 'imperial';
      const url = `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${apiKey}&units=${units}`;

      try {
        const response = await fetch(url);
        if (!response.ok) throw new Error('Weather data fetch failed');
        const data = await response.json();
        setWeather({
          temperature: data.main.temp,
          feelsLike: data.main.feels_like,
          pressure: data.main.pressure,
          humidity: data.main.humidity,
        });
      } catch (error) {
        console.error('Error fetching weather data:', error);
        setErrorMessage('api call to openweathermap failed.. check the console');
      } finally {
        setLoading(false);
      }
    }

    fetchWeatherData();
  }, []);

  return (
    <div className="weather-page">
      <SEO
        title="Weather Station - Tron Swan"
        description="Check the current weather conditions in Bozeman with our robot weather station featuring thermomotron, feelometer, baromotron, and humidotron readings."
        keywords="weather, Bozeman, temperature, humidity, pressure, robot weather station"
        url="/weather"
      />
      
      <div className="weather-content">
        <h1 className="weather-title" data-testid="weather-title">weathertron</h1>
        <p className="weather-subtitle">🌡️ robot weather station monitoring Bozeman conditions</p>
        
        {loading ? (
          <div className="loading-spinner" aria-label="Loading weather data" />
        ) : errorMessage ? (
          <div className="error-message">{errorMessage}</div>
        ) : (
          <WeatherDisplay weather={weather} />
        )}

        <div className="weather-info">
          <p>Real-time weather data from OpenWeatherMap API</p>
          <p>Location: {process.env.REACT_APP_CITY || 'Bozeman'}, Montana</p>
        </div>
      </div>
    </div>
  );
}

export default Weather;
