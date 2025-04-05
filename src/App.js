import React, { useState, useEffect } from 'react';
import logo from './robotard-removebg-preview.png';
import './App.css';

function FizzBuzz({ number }) {
  const generateFizzBuzz = (num) => {
    let result = [];
    for (let i = 1; i <= num; i++) {
      if (i % 3 === 0 && i % 5 === 0) {
        result.push('FizzBuzz');
      } else if (i % 3 === 0) {
        result.push('Fizz');
      } else if (i % 5 === 0) {
        result.push('Buzz');
      } else {
        result.push(i);
      }
    }
    return result.join(', ');
  };

  return (
    <div className="fizzbuzz-container">
      <h2 className="fizzbuzz-title">FizzBuzz</h2>
      <p className="fizzbuzz-sequence">{generateFizzBuzz(number)}</p>
    </div>
  );
}

function WeatherDisplay({ weather }) {
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

function App() {
  const [weather, setWeather] = useState({ temperature: null, feelsLike: null, pressure: null, humidity: null });
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState('');
  const [inputNumber, setInputNumber] = useState('');

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

  const handleInputChange = (event) => {
    setInputNumber(event.target.value);
  };

  return (
    <div className="App" data-testid="app-container">
      <header className="App-header" data-testid="app-header">
        <div className="App-container">
          <h1 className="App-title" data-testid="app-title">tron swan dot com</h1>
          <img src={logo} className="App-logo" alt="logo" data-testid="app-logo" />
          
          {loading ? (
            <div className="loading-spinner" aria-label="Loading weather data" />
          ) : errorMessage ? (
            <p className="error-message">{errorMessage}</p>
          ) : (
            <WeatherDisplay weather={weather} />
          )}

          <div>
            <input
              type="number"
              value={inputNumber}
              onChange={handleInputChange}
              placeholder="Enter a number"
              aria-label="Enter a number for FizzBuzz"
            />
            {inputNumber && <FizzBuzz number={parseInt(inputNumber)} />}
          </div>

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
        </div>
      </header>
    </div>
  );
}

export default App;
