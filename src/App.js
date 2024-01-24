import React, { useState, useEffect } from 'react';
import logo from './robotard-removebg-preview.png';
import './App.css';

function App() {
  const [temperature, setTemperature] = useState(null);

  useEffect(() => {
    const fetchTemperature = async () => {
      const apiKey = process.env.REACT_APP_API_KEY; // Accessing the API key from DO
      const city = 'Bozeman';
      const url = `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${apiKey}&units=imperial`;

      try {
        const response = await fetch(url);
        const data = await response.json();
        setTemperature(data.main.temp);
      } catch (error) {
        console.error('Error fetching temperature:', error);
      }
    };

    fetchTemperature();
  }, []);

  return (
    <div className="App">
      <header className="App-header">
        <img src={logo} className="App-logo" alt="logo" />
        {temperature && <p>boz tron dot temp: {temperature}°F</p>}
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
