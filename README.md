# tron swan dot com

[![Test Coverage](https://img.shields.io/badge/coverage-93.35%25-brightgreen)](https://github.com/swantron/tronswan/actions)
[![Build Status](https://github.com/swantron/tronswan/workflows/react%20app%20CI:CD%20with%20playwright/badge.svg)](https://github.com/swantron/tronswan/actions)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

building / deploying / learning

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
- `yarn test:coverage`: Runs tests with coverage reporting
- `yarn update-badge`: Updates the coverage badge in README with current test coverage
- `yarn type-check`: Runs TypeScript type checking without emitting files
- `yarn build`: Builds the app for production
- `yarn eject`: Ejects from Create React App

### TypeScript

This project uses TypeScript for enhanced type safety and developer experience.

- **Type Safety**: All services and API responses are fully typed
- **Gradual Migration**: Services layer migrated to TypeScript, components remain in JavaScript for now
- **Type Checking**: Run `yarn type-check` to validate types without building
- **Configuration**: `tsconfig.json` configured for React and modern JavaScript features

### Testing

This project maintains high test coverage with comprehensive unit tests for all components, hooks, and services.

- **Current Coverage**: 93.35%
- **Test Framework**: Jest + React Testing Library
- **Coverage Reports**: Generated automatically as part of CI/CD pipeline
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

- **`update-coverage-badge.js`**: Automatically updates the test coverage badge in the README based on Jest coverage reports.

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License.
