# tron swan dot com

[![Test Coverage](https://img.shields.io/badge/coverage-93.35%25-brightgreen)](https://github.com/swantron/tronswan/actions)
[![Build Status](https://github.com/swantron/tronswan/workflows/react%20app%20CI:CD%20with%20playwright/badge.svg)](https://github.com/swantron/tronswan/actions)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

building / deploying / learning

**Live Demo**: [tronswan.com](https://tronswan.com)

## Features

- 🦢 **Personal Blog Integration** - Fetches posts from swantron.com
- 🍳 **Recipe Collection** - Displays recipes from chomptron.com  
- 🌡️ **Weather Station** - Real-time weather data for Bozeman, MT
- 🎮 **Interactive Games** - FizzBuzz calculator and fun components
- 📱 **Responsive Design** - Works on all devices
- ⚡ **Fast Performance** - Optimized with modern React patterns
- 🧪 **High Test Coverage** - 93%+ test coverage with Vitest

## Tech Stack

- **Frontend**: React 18.3, TypeScript, React Router
- **Styling**: CSS3 with CSS Variables, Responsive Design
- **Testing**: Vitest, React Testing Library, Playwright
- **Build Tools**: Vite, TypeScript
- **Deployment**: DigitalOcean App Platform
- **APIs**: WordPress REST API, OpenWeatherMap API
- **Package Manager**: Yarn

## Getting Started

### Prerequisites

- Node.js (v20 or higher)
- Yarn package manager
- Git

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/swantron/tronswan.git
   cd tronswan
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

- `yarn dev`: Runs the app in development mode with Vite
- `yarn start`: Alias for `yarn dev`
- `yarn test`: Launches the Vitest test runner in watch mode
- `yarn test:run`: Runs tests once and exits
- `yarn test:coverage`: Runs tests with coverage reporting
- `yarn test:ui`: Launches the Vitest UI for interactive testing
- `yarn type-check`: Runs TypeScript type checking without emitting files
- `yarn build`: Builds the app for production with Vite
- `yarn preview`: Preview the production build locally

### TypeScript

This project is fully migrated to TypeScript for enhanced type safety and developer experience.

- **Full TypeScript**: All components, hooks, services, and tests are written in TypeScript
- **Type Safety**: Comprehensive type definitions for all API responses, component props, and state
- **Type Checking**: Run `yarn type-check` to validate types without building
- **Configuration**: `tsconfig.json` configured for React and modern JavaScript features
- **Test Files**: All test files use `.test.tsx` extension with full TypeScript support
- **Migration Complete**: Successfully migrated from Jest to Vitest with full TypeScript support

### Testing

This project maintains high test coverage with comprehensive unit tests for all components, hooks, and services.

- **Current Coverage**: 93.35%
- **Test Framework**: Vitest + React Testing Library
- **TypeScript Support**: All tests written in TypeScript with full type safety
- **Fast Execution**: Vitest provides faster test execution compared to Jest
- **Modern Tooling**: Built on Vite for optimal performance and developer experience
- **Coverage Reports**: Generated automatically as part of CI/CD pipeline
- **Coverage Badge**: Shows current test coverage percentage

To run tests locally:
```bash
# Run all tests in watch mode
yarn test

# Run tests once and exit
yarn test:run

# Run tests with coverage
yarn test:coverage

# Launch interactive test UI
yarn test:ui
```

### Coverage Badge Management

The project automatically maintains an up-to-date test coverage badge in the README. The badge shows the current test coverage percentage and links to the GitHub Actions workflow.

**To update the coverage badge:**

1. Run tests with coverage:
   ```bash
   yarn test:coverage
   ```

2. Update the badge in README:
   ```bash
   yarn update-badge
   ```

This will:
- Read the coverage data from `coverage/coverage-summary.json`
- Update the coverage badge at the top of the README
- Update the coverage percentage in the Testing section
- Provide console output showing what was updated

**Note:** The coverage badge is automatically updated as part of the CI/CD pipeline, but you can manually update it locally using the above commands.



## Deployment

The application is deployed to DigitalOcean using their App Platform. The deployment is automated through GitHub Actions.

### Environment Variables

- `REACT_APP_API_KEY`: OpenWeatherMap API key
- `REACT_APP_CITY`: Default city for weather data
- `REACT_APP_UNITS`: Units for weather data (imperial/metric)

## Scripts

The project includes several utility scripts in the `scripts/` directory:

- **`update-coverage-badge.js`**: Automatically updates the test coverage badge in the README based on Vitest coverage reports.

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## Troubleshooting

### Common Issues

**Build fails with Node.js version error**
- Ensure you're using Node.js v20 or higher
- Check with `node --version`

**Weather data not loading**
- Verify your OpenWeatherMap API key is set in `.env`
- Check that `REACT_APP_API_KEY` is correctly configured

**Blog posts not loading**
- Check network connectivity to swantron.com and chomptron.com
- Verify the WordPress APIs are accessible

**Tests failing**
- Run `yarn install` to ensure all dependencies are installed
- Check that all environment variables are set

## License

This project is licensed under the MIT License.
