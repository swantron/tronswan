import React, { useState, useEffect } from 'react';
import logo from './robotard-removebg-preview.png';
import './App.css';

function App() {
  const [temperature, setTemperature] = useState(null);
  const [feelsLike, setFeelsLike] = useState(null);
  const [pressure, setPressure] = useState(null);
  const [humidity, setHumidity] = useState(null);

  useEffect(() => {
    const fetchWeatherData = async () => {
      const apiKey = process.env.REACT_APP_API_KEY; // Accessing the API key from DO
      const city = 'Bozeman';
      const url = `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${apiKey}&units=imperial`;

      try {
        const response = await fetch(url);
        const data = await response.json();
        setTemperature(data.main.temp);
        setFeelsLike(data.main.feels_like);
        setPressure(data.main.pressure);
        setHumidity(data.main.humidity);
      } catch (error) {
        console.error('Error fetching weather data:', error);
      }
    };

    fetchWeatherData();
  }, []);

  return (
    <div className="App" data-testid="app-container">
      <header className="App-header" data-testid="app-header">
        <h1 className="App-title" data-testid="app-title">tron swan dot com</h1>
        <img src={logo} className="App-logo" alt="logo" data-testid="app-logo" />
        {temperature && <p data-testid="temperature-display">thermomotron | {temperature}°F</p>}
        {feelsLike && <p data-testid="feels-like-display">feelometer | {feelsLike}°F</p>}
        {pressure && <p data-testid="pressure-display">baromotron | {pressure} hPa</p>}
        {humidity && <p data-testid="humidity-display">humidotron | {humidity}%</p>}
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
