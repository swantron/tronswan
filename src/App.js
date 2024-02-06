import React, { useState, useEffect } from 'react';
import logo from './robotard-removebg-preview.png';
import './App.css';

function App() {
  const [weather, setWeather] = useState({ temperature: null, feelsLike: null, pressure: null, humidity: null });
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    async function fetchWeatherData() {
      const apiKey = process.env.REACT_APP_API_KEY;
      const city = process.env.REACT_APP_CITY || 'Bozeman';
      const units = process.env.REACT_APP_UNITS || 'imperial';
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
    <div className="App" data-testid="app-container">
      <header className="App-header" data-testid="app-header">
        <h1 className="App-title" data-testid="app-title">tron swan dot com</h1>
        <img src={logo} className="App-logo" alt="logo" data-testid="app-logo" />
        {loading ? (
          <p>Loading...</p>
        ) : errorMessage ? (
          <p className="error-message">{errorMessage}</p>
        ) : (
          <>
            {weather.temperature && <p data-testid="temperature-display">thermomotron | {weather.temperature}°F</p>}
            {weather.feelsLike && <p data-testid="feels-like-display">feelometer | {weather.feelsLike}°F</p>}
            {weather.pressure && <p data-testid="pressure-display">baromotron | {weather.pressure} hPa</p>}
            {weather.humidity && <p data-testid="humidity-display">humidotron | {weather.humidity}%</p>}
          </>
        )}
        <a
          className="App-link"
          href="https://swantron.com"
          target="_blank"
          rel="noopener noreferrer"
          data-testid="swantron-link"
        >
          swan tron dot com
        </a>
        <a
          className="App-link"
          href="https://chomptron.com"
          target="_blank"
          rel="noopener noreferrer"
          data-testid="chomptron-link"
        >
          chomp tron dot com
        </a>
      </header>
    </div>
  );
}

export default App;
