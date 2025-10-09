import React, { useState, useEffect } from 'react';

import { logger } from '../../utils/logger';
import { runtimeConfig } from '../../utils/runtimeConfig';

import SEO from './SEO';
import '../../styles/Weather.css';

interface WeatherData {
  temperature: number | null;
  feelsLike: number | null;
  tempMin: number | null;
  tempMax: number | null;
  pressure: number | null;
  humidity: number | null;
  windSpeed: number | null;
  windDirection: number | null;
  visibility: number | null;
  cloudCoverage: number | null;
  sunrise: number | null;
  sunset: number | null;
  weatherDescription: string | null;
  city: string | null;
  country: string | null;
}

interface ForecastItem {
  dt: number;
  main: {
    temp: number;
    feels_like: number;
    humidity: number;
    pressure: number;
  };
  weather: Array<{
    main: string;
    description: string;
    icon: string;
  }>;
  dt_txt: string;
}

interface DailyForecast {
  date: string;
  high: number;
  low: number;
  description: string;
  icon: string;
  humidity: number;
}

interface WeatherDisplayProps {
  weather: WeatherData;
  temperatureUnit: 'imperial' | 'metric' | 'kelvin';
}

interface ForecastDisplayProps {
  forecast: DailyForecast[];
  temperatureUnit: 'imperial' | 'metric' | 'kelvin';
}

// Temperature conversion utilities
const convertTemperature = (
  temp: number,
  fromUnit: 'imperial' | 'metric' | 'kelvin',
  toUnit: 'imperial' | 'metric' | 'kelvin'
): number => {
  // Convert to Celsius first
  let celsius: number;
  if (fromUnit === 'imperial') {
    celsius = ((temp - 32) * 5) / 9;
  } else if (fromUnit === 'metric') {
    celsius = temp;
  } else {
    // kelvin
    celsius = temp - 273.15;
  }

  // Convert from Celsius to target unit
  if (toUnit === 'imperial') {
    return (celsius * 9) / 5 + 32;
  } else if (toUnit === 'metric') {
    return celsius;
  } else {
    // kelvin
    return celsius + 273.15;
  }
};

function ForecastDisplay({ forecast, temperatureUnit }: ForecastDisplayProps) {
  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
    });
  };

  const getTemperatureUnit = () => {
    if (temperatureUnit === 'imperial') return '°F';
    if (temperatureUnit === 'metric') return '°C';
    return 'K';
  };

  const convertTempForDisplay = (temp: number) => {
    if (temperatureUnit === 'kelvin') {
      return convertTemperature(temp, 'metric', 'kelvin');
    }
    return temp;
  };

  return (
    <div className='forecast-container'>
      <h3 className='forecast-title'>5-Day Forecast</h3>
      <div className='forecast-grid'>
        {forecast.map((day, index) => (
          <div key={index} className='forecast-day'>
            <div className='forecast-date'>{formatDate(day.date)}</div>
            <div className='forecast-icon'>
              <img
                src={`https://openweathermap.org/img/wn/${day.icon}@2x.png`}
                alt={day.description}
                width='50'
                height='50'
              />
            </div>
            <div className='forecast-temps'>
              <span className='forecast-high'>
                {Math.round(convertTempForDisplay(day.high))}
                {getTemperatureUnit()}
              </span>
              <span className='forecast-low'>
                {Math.round(convertTempForDisplay(day.low))}
                {getTemperatureUnit()}
              </span>
            </div>
            <div className='forecast-description'>{day.description}</div>
            <div className='forecast-humidity'>💧 {day.humidity}%</div>
          </div>
        ))}
      </div>
    </div>
  );
}

function WeatherDisplay({ weather, temperatureUnit }: WeatherDisplayProps) {
  const formatTime = (timestamp: number) => {
    return new Date(timestamp * 1000).toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getWindDirection = (degrees: number) => {
    const directions = [
      'N',
      'NNE',
      'NE',
      'ENE',
      'E',
      'ESE',
      'SE',
      'SSE',
      'S',
      'SSW',
      'SW',
      'WSW',
      'W',
      'WNW',
      'NW',
      'NNW',
    ];
    return directions[Math.round(degrees / 22.5) % 16];
  };

  const getTemperatureUnit = () => {
    if (temperatureUnit === 'imperial') return '°F';
    if (temperatureUnit === 'metric') return '°C';
    return 'K';
  };

  const convertTempForDisplay = (temp: number) => {
    if (temperatureUnit === 'kelvin') {
      return convertTemperature(temp, 'metric', 'kelvin');
    }
    return temp;
  };

  return (
    <div className='weather-container' data-testid='weather-display'>
      {/* Weather Description */}
      {weather.weatherDescription && (
        <div className='weather-item weather-description'>
          <p data-testid='weather-description-display'>
            🌤️ {weather.weatherDescription}
          </p>
        </div>
      )}

      {/* Temperature Section */}
      <div className='weather-section'>
        <h3>Temperature</h3>
        {weather.temperature && (
          <div className='weather-item'>
            <p data-testid='temperature-display'>
              🌡️ {Math.round(convertTempForDisplay(weather.temperature))}
              {getTemperatureUnit()}
            </p>
          </div>
        )}
        {weather.feelsLike && (
          <div className='weather-item'>
            <p data-testid='feels-like-display'>
              🤔 Feels like{' '}
              {Math.round(convertTempForDisplay(weather.feelsLike))}
              {getTemperatureUnit()}
            </p>
          </div>
        )}
        {weather.tempMin && weather.tempMax && (
          <div className='weather-item'>
            <p data-testid='temp-range-display'>
              📊 Range: {Math.round(convertTempForDisplay(weather.tempMin))}
              {getTemperatureUnit()} -{' '}
              {Math.round(convertTempForDisplay(weather.tempMax))}
              {getTemperatureUnit()}
            </p>
          </div>
        )}
      </div>

      {/* Atmospheric Conditions */}
      <div className='weather-section'>
        <h3>Atmospheric Conditions</h3>
        {weather.pressure && (
          <div className='weather-item'>
            <p data-testid='pressure-display'>
              🏔️ Pressure: {weather.pressure} hPa
            </p>
          </div>
        )}
        {weather.humidity && (
          <div className='weather-item'>
            <p data-testid='humidity-display'>
              💧 Humidity: {weather.humidity}%
            </p>
          </div>
        )}
        {weather.cloudCoverage !== null && (
          <div className='weather-item'>
            <p data-testid='clouds-display'>
              ☁️ Cloud Coverage: {weather.cloudCoverage}%
            </p>
          </div>
        )}
      </div>

      {/* Wind & Visibility */}
      <div className='weather-section'>
        <h3>Wind & Visibility</h3>
        {weather.windSpeed && (
          <div className='weather-item'>
            <p data-testid='wind-display'>
              💨 Wind: {weather.windSpeed} mph{' '}
              {weather.windDirection
                ? getWindDirection(weather.windDirection)
                : ''}
            </p>
          </div>
        )}
        {weather.visibility && (
          <div className='weather-item'>
            <p data-testid='visibility-display'>
              👁️ Visibility: {Math.round(weather.visibility / 1609.34)} miles
            </p>
          </div>
        )}
      </div>

      {/* Sun Times */}
      {(weather.sunrise || weather.sunset) && (
        <div className='weather-section'>
          <h3>Sun Times</h3>
          {weather.sunrise && (
            <div className='weather-item'>
              <p data-testid='sunrise-display'>
                🌅 Sunrise: {formatTime(weather.sunrise)}
              </p>
            </div>
          )}
          {weather.sunset && (
            <div className='weather-item'>
              <p data-testid='sunset-display'>
                🌇 Sunset: {formatTime(weather.sunset)}
              </p>
            </div>
          )}
        </div>
      )}

      {/* Location */}
      {weather.city && (
        <div className='weather-item weather-location'>
          <p data-testid='location-display'>
            📍 {weather.city}
            {weather.country ? `, ${weather.country}` : ''}
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
    tempMin: null,
    tempMax: null,
    pressure: null,
    humidity: null,
    windSpeed: null,
    windDirection: null,
    visibility: null,
    cloudCoverage: null,
    sunrise: null,
    sunset: null,
    weatherDescription: null,
    city: null,
    country: null,
  });
  const [loading, setLoading] = useState<boolean>(true);
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [cityInput, setCityInput] = useState<string>('');
  const [currentCity, setCurrentCity] = useState<string>('');
  const [viewMode, setViewMode] = useState<'current' | 'forecast'>('current');
  const [forecast, setForecast] = useState<DailyForecast[]>([]);
  const [temperatureUnit, setTemperatureUnit] = useState<
    'imperial' | 'metric' | 'kelvin'
  >('imperial');

  const groupForecastByDay = (
    forecastList: ForecastItem[]
  ): DailyForecast[] => {
    const grouped = forecastList.reduce(
      (acc, item) => {
        const date = new Date(item.dt * 1000).toDateString();
        if (!acc[date]) acc[date] = [];
        acc[date].push(item);
        return acc;
      },
      {} as Record<string, ForecastItem[]>
    );

    return Object.values(grouped).map(dayItems => ({
      date: dayItems[0].dt_txt.split(' ')[0],
      high: Math.max(...dayItems.map(item => item.main.temp)),
      low: Math.min(...dayItems.map(item => item.main.temp)),
      description: dayItems[0].weather[0].description,
      icon: dayItems[0].weather[0].icon,
      humidity: Math.round(
        dayItems.reduce((sum, item) => sum + item.main.humidity, 0) /
          dayItems.length
      ),
    }));
  };

  const fetchWeatherData = async (city: string) => {
    setLoading(true);
    setErrorMessage('');

    logger.info('Weather data fetch started', {
      city,
      temperatureUnit,
      timestamp: new Date().toISOString(),
    });

    try {
      // Initialize runtime config if not already done
      await runtimeConfig.initialize();

      const apiKey = runtimeConfig.get('VITE_WEATHER_API_KEY');
      // Use metric for Kelvin since OpenWeatherMap doesn't support Kelvin directly
      const apiUnit = temperatureUnit === 'kelvin' ? 'metric' : temperatureUnit;
      const url = `https://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(city)}&appid=${apiKey}&units=${apiUnit}`;

      const response = await logger.measureAsync(
        'weather-api-call',
        async () => {
          return await fetch(url);
        },
        { city, apiUnit }
      );

      if (!response.ok) {
        if (response.status === 404) {
          logger.warn('City not found in weather API', {
            city,
            status: response.status,
          });
          throw new Error(
            'City not found. Please check the spelling and try again.'
          );
        }
        logger.error('Weather API error', {
          city,
          status: response.status,
          statusText: response.statusText,
        });
        throw new Error('Weather data fetch failed');
      }

      const data = await response.json();

      logger.info('Weather data fetched successfully', {
        city: data.name,
        country: data.sys.country,
        temperature: data.main.temp,
        description: data.weather?.[0]?.description,
        temperatureUnit,
        timestamp: new Date().toISOString(),
      });

      setWeather({
        temperature: data.main.temp,
        feelsLike: data.main.feels_like,
        tempMin: data.main.temp_min,
        tempMax: data.main.temp_max,
        pressure: data.main.pressure,
        humidity: data.main.humidity,
        windSpeed: data.wind?.speed,
        windDirection: data.wind?.deg,
        visibility: data.visibility,
        cloudCoverage: data.clouds?.all,
        sunrise: data.sys.sunrise,
        sunset: data.sys.sunset,
        weatherDescription: data.weather?.[0]?.description,
        city: data.name,
        country: data.sys.country,
      });
      setCurrentCity(data.name);
    } catch (error) {
      logger.error('Error fetching weather data', { error, city });
      setErrorMessage(
        error instanceof Error
          ? error.message
          : 'api call to openweathermap failed.. check the console'
      );
    } finally {
      setLoading(false);
    }
  };

  const fetchForecastData = async (city: string) => {
    setLoading(true);
    setErrorMessage('');

    logger.info('Forecast data fetch started', {
      city,
      temperatureUnit,
      timestamp: new Date().toISOString(),
    });

    try {
      await runtimeConfig.initialize();

      const apiKey = runtimeConfig.get('VITE_WEATHER_API_KEY');
      // Use metric for Kelvin since OpenWeatherMap doesn't support Kelvin directly
      const apiUnit = temperatureUnit === 'kelvin' ? 'metric' : temperatureUnit;
      const url = `https://api.openweathermap.org/data/2.5/forecast?q=${encodeURIComponent(city)}&appid=${apiKey}&units=${apiUnit}`;

      const response = await logger.measureAsync(
        'forecast-api-call',
        async () => {
          return await fetch(url);
        },
        { city, apiUnit }
      );

      if (!response.ok) {
        if (response.status === 404) {
          logger.warn('City not found in forecast API', {
            city,
            status: response.status,
          });
          throw new Error(
            'City not found. Please check the spelling and try again.'
          );
        }
        logger.error('Forecast API error', {
          city,
          status: response.status,
          statusText: response.statusText,
        });
        throw new Error('Forecast data fetch failed');
      }

      const data = await response.json();
      const dailyForecast = groupForecastByDay(data.list);

      logger.info('Forecast data fetched successfully', {
        city: data.city.name,
        forecastDays: dailyForecast.length,
        temperatureUnit,
        timestamp: new Date().toISOString(),
      });

      setForecast(dailyForecast);
      setCurrentCity(data.city.name);
    } catch (error) {
      logger.error('Error fetching forecast data', { error, city });
      setErrorMessage(
        error instanceof Error ? error.message : 'Forecast data fetch failed'
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Initialize runtime config and get default city
    const initializeWeather = async () => {
      logger.info('Weather component initializing', {
        timestamp: new Date().toISOString(),
        userAgent: navigator.userAgent,
      });

      await runtimeConfig.initialize();
      const defaultCity = runtimeConfig.getWithDefault(
        'VITE_WEATHER_CITY',
        'Bozeman'
      );

      logger.info('Weather component initialized with default city', {
        defaultCity,
        temperatureUnit,
        timestamp: new Date().toISOString(),
      });

      setCurrentCity(defaultCity);
      await fetchWeatherData(defaultCity);
      await fetchForecastData(defaultCity);
    };

    initializeWeather();
  }, []);

  const handleCitySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (cityInput.trim()) {
      logger.info('Weather city search submitted', {
        city: cityInput.trim(),
        temperatureUnit,
        timestamp: new Date().toISOString(),
      });

      await fetchWeatherData(cityInput.trim());
      await fetchForecastData(cityInput.trim());
      setCityInput('');
    }
  };

  const handleCityChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setCityInput(e.target.value);
  };

  const handleTemperatureUnitChange = async (
    unit: 'imperial' | 'metric' | 'kelvin'
  ) => {
    logger.info('Weather temperature unit changed', {
      from: temperatureUnit,
      to: unit,
      currentCity,
      timestamp: new Date().toISOString(),
    });

    setTemperatureUnit(unit);
    // Refetch data with new unit
    if (currentCity) {
      await fetchWeatherData(currentCity);
      await fetchForecastData(currentCity);
    }
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
                placeholder='Enter city name (e.g., Bozeman, London, Tokyo)'
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

        <div className='weather-controls'>
          <div className='view-toggle'>
            <button
              className={`toggle-button ${viewMode === 'current' ? 'active' : ''}`}
              onClick={() => {
                logger.info('Weather view mode changed', {
                  from: viewMode,
                  to: 'current',
                  currentCity,
                  timestamp: new Date().toISOString(),
                });
                setViewMode('current');
              }}
              disabled={loading}
            >
              Current
            </button>
            <button
              className={`toggle-button ${viewMode === 'forecast' ? 'active' : ''}`}
              onClick={() => {
                logger.info('Weather view mode changed', {
                  from: viewMode,
                  to: 'forecast',
                  currentCity,
                  timestamp: new Date().toISOString(),
                });
                setViewMode('forecast');
              }}
              disabled={loading}
            >
              Forecast
            </button>
          </div>

          <div className='temperature-unit-toggle'>
            <button
              className={`unit-button ${temperatureUnit === 'imperial' ? 'active' : ''}`}
              onClick={() => handleTemperatureUnitChange('imperial')}
              disabled={loading}
            >
              °F
            </button>
            <button
              className={`unit-button ${temperatureUnit === 'metric' ? 'active' : ''}`}
              onClick={() => handleTemperatureUnitChange('metric')}
              disabled={loading}
            >
              °C
            </button>
            <button
              className={`unit-button ${temperatureUnit === 'kelvin' ? 'active' : ''}`}
              onClick={() => handleTemperatureUnitChange('kelvin')}
              disabled={loading}
            >
              K
            </button>
          </div>
        </div>

        {loading ? (
          <div className='loading-spinner' aria-label='Loading weather data' />
        ) : errorMessage ? (
          <div className='error-message'>{errorMessage}</div>
        ) : viewMode === 'current' ? (
          <WeatherDisplay weather={weather} temperatureUnit={temperatureUnit} />
        ) : (
          <ForecastDisplay
            forecast={forecast}
            temperatureUnit={temperatureUnit}
          />
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
