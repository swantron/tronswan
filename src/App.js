import React, { useState, useEffect } from 'react';
import logo from './robotard-removebg-preview.png';
import './App.css';

function App() {
  const [temperature, setTemperature] = useState(null);
  const [feelsLike, setFeelsLike] = useState(null); // State for "feels like" temperature
  const [pressure, setPressure] = useState(null);
  const [humidity, setHumidity] = useState(null); // State for humidity

  useEffect(() => {
    const fetchWeatherData = async () => {
      const apiKey = process.env.REACT_APP_API_KEY; // Accessing the API key from DO
      const city = 'Bozeman';
      const url = `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${apiKey}&units=imperial`;

      try {
        const response = await fetch(url);
        const data = await response.json();
        setTemperature(data.main.temp);
        setFeelsLike(data.main.feels_like); // Set "feels like" temperature
        setPressure(data.main.pressure);
        setHumidity(data.main.humidity); // Set humidity
      } catch (error) {
        console.error('Error fetching weather data:', error);
      }
    };

    fetchWeatherData();
  }, []);

  return (
    <div className="App">
      <header className="App-header">
        <img src={logo} className="App-logo" alt="logo" />
        <p>tron swan dot com</p>
        {temperature && <p>thermomotron | {temperature}°F</p>}
        {feelsLike && <p>feelometer | {feelsLike}°F</p>} {/* Display "feels like" temperature */}
        {pressure && <p>baromotron | {pressure} hPa</p>}
        {humidity && <p>humidotron | {humidity}%</p>} {/* Display humidity */}
        <a
          className="App-link"
          href="https://swantron.com"
          target="_blank"
          rel="noopener noreferrer"
        >
          swan tron dot com
        </a>
        <a
          className="App-link"
          href="https://chomptron.com"
          target="_blank"
          rel="noopener noreferrer"
        >
          chomp tron dot com
        </a>
      </header>
    </div>
  );
}

export default App;
