# Chomptron

[![Test Coverage](https://img.shields.io/badge/coverage-93.77%25-brightgreen)](https://github.com/swantron/tronswan/actions)
[![Build Status](https://github.com/swantron/tronswan/workflows/react%20app%20CI:CD%20with%20playwright/badge.svg)](https://github.com/swantron/tronswan/actions)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

A modern web application that displays recipes from chomptron.com, along with weather data and a fun FizzBuzz feature.

## Features

- **Recipe Display**: Browse and search recipes from chomptron.com
  - Responsive recipe cards with featured images
  - Detailed recipe pages with full content
  - Category and tag filtering
  - Search functionality
  - Pagination support

- **Weather Integration**: Real-time weather data display
  - Temperature
  - Feels like temperature
  - Pressure
  - Humidity

- **FizzBuzz Game**: Interactive number game
  - Enter any number to see the FizzBuzz sequence
  - Fun way to test the application

- **Modern UI**: Clean and responsive design
  - Mobile-friendly layout
  - Smooth animations
  - Loading states
  - Error handling

## Getting Started

### Prerequisites

- Node.js (v18 or higher)
- Yarn package manager
- Git

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/swantron/chomptron.git
   cd chomptron
   ```

2. Install dependencies:
   ```bash
   yarn install
   ```

3. Create a `.env` file in the root directory with the following variables:
   ```
   REACT_APP_API_KEY=your_openweathermap_api_key
   REACT_APP_CITY=Bozeman
   REACT_APP_UNITS=imperial
   ```

### Available Scripts

- `yarn start`: Runs the app in development mode
- `yarn test`: Launches the test runner
- `yarn test --coverage`: Runs tests with coverage reporting
- `yarn build`: Builds the app for production
- `yarn eject`: Ejects from Create React App

### Testing

This project maintains high test coverage with comprehensive unit tests for all components, hooks, and services.

- **Current Coverage**: 93.77%
- **Test Framework**: Jest + React Testing Library
- **Coverage Reports**: Generated automatically on every push to main
- **Coverage Badge**: Shows current test coverage percentage

To run tests locally:
```bash
# Run all tests
yarn test

# Run tests with coverage
yarn test:coverage

# Run tests in watch mode
yarn test --watch
```



## Deployment

The application is deployed to DigitalOcean using their App Platform. The deployment is automated through GitHub Actions.

### Environment Variables

- `REACT_APP_API_KEY`: OpenWeatherMap API key
- `REACT_APP_CITY`: Default city for weather data
- `REACT_APP_UNITS`: Units for weather data (imperial/metric)

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License.
