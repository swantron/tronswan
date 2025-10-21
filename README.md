# tron swan dot com

[![Test Coverage](https://img.shields.io/badge/coverage-93.98%25-brightgreen?logo=vitest&logoColor=white)](https://github.com/swantron/tronswan/actions)
[![Build Status](https://github.com/swantron/tronswan/workflows/react%20app%20CI:CD%20with%20playwright/badge.svg)](https://github.com/swantron/tronswan/actions)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

building / deploying / learning

**Live Demo**: [tronswan.com](https://tronswan.com)

## 📚 Documentation

- **[Environment Configuration](docs/ENVIRONMENT_CONFIG.md)** - Complete guide for setting up environment variables and API tokens
- **[CI/CD Setup](docs/CI_SETUP.md)** - Automated testing and deployment verification setup
- **[Health Page Guide](docs/HEALTH_PAGE_README.md)** - Service health monitoring and deployment status features
- **[Logging Guide](docs/LOGGING_GUIDE.md)** - Comprehensive guide to the structured logging system and best practices
- **[Google Docs Setup](docs/GOOGLE_DOCS_SETUP.md)** - Guide for setting up Google Docs API for dynamic resume content

## Features

- 🦢 **Personal Blog Integration** - Fetches posts from swantron.com
- 🍳 **AI Recipe App** - chomptron.com - AI-powered recipe discovery using Gemini on GCP  
- 🌡️ **Weather Station** - Real-time weather data for Bozeman, MT
- 🎮 **Interactive Games** - FizzBuzz calculator and fun components
- 📊 **Health Monitoring** - Real-time service health and deployment status ([see Health Page Guide](docs/HEALTH_PAGE_README.md))
- 📱 **Responsive Design** - Works on all devices
- ⚡ **Fast Performance** - Optimized with modern React patterns
- 🧪 **High Test Coverage** - 93.98% test coverage with Vitest
- 🚀 **Automated Deployment** - CI/CD pipeline with post-deployment verification ([see CI/CD Setup](docs/CI_SETUP.md))

## Tech Stack

- **Frontend**: React 18.3, TypeScript, React Router
- **Styling**: CSS3 with CSS Variables, Responsive Design
- **Testing**: Vitest, React Testing Library, Playwright
- **Build Tools**: Vite, TypeScript
- **Deployment**: DigitalOcean App Platform
- **APIs**: WordPress REST API, OpenWeatherMap API, GitHub API, DigitalOcean API
- **Package Manager**: Yarn
- **CI/CD**: GitHub Actions with Playwright testing

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

3. Create a `.env` file in the root directory. See [Environment Configuration](docs/ENVIRONMENT_CONFIG.md) for detailed setup:
   ```bash
   # Basic weather configuration
   VITE_WEATHER_API_KEY=your_openweathermap_api_key
   VITE_WEATHER_CITY=Bozeman
   VITE_WEATHER_UNITS=imperial
   
   # Optional: Health monitoring features
   VITE_GITHUB_TOKEN=your_github_token
   VITE_DIGITALOCEAN_TOKEN=your_digitalocean_token
   ```

### Available Scripts

- `yarn dev`: Runs the app in development mode with Vite
- `yarn start`: Alias for `yarn dev`
- `yarn test`: Launches the Vitest test runner in watch mode
- `yarn test:run`: Runs tests once and exits
- `yarn test:coverage`: Runs tests with coverage reporting
- `yarn test:ui`: Launches the Vitest UI for interactive testing
- `yarn test:e2e`: Runs Playwright end-to-end tests
- `yarn test:all`: Runs both unit and e2e tests
- `yarn type-check`: Runs TypeScript type checking without emitting files
- `yarn build`: Builds the app for production with Vite
- `yarn preview`: Preview the production build locally

### Project Structure

```
src/
├── components/          # React components
│   ├── DigitalOceanStatus.tsx  # Infrastructure monitoring
│   ├── GitHubStatus.tsx        # GitHub Actions monitoring
│   ├── HealthPage.tsx          # Main health dashboard
│   └── ...                     # Other components
├── services/            # API service modules
│   ├── digitalOceanService.ts  # DigitalOcean API integration
│   ├── githubService.ts        # GitHub API integration
│   └── ...                     # Other services
├── hooks/               # Custom React hooks
├── utils/               # Utility functions and configuration
└── styles/              # CSS stylesheets

tests/                   # Playwright end-to-end tests
scripts/                 # Utility scripts
.github/workflows/       # GitHub Actions CI/CD
```

### TypeScript

This project is fully migrated to TypeScript for enhanced type safety and developer experience.

- **Full TypeScript**: All components, hooks, services, and tests are written in TypeScript
- **Type Safety**: Comprehensive type definitions for all API responses, component props, and state
- **Type Checking**: Run `yarn type-check` to validate types without building
- **Configuration**: `tsconfig.json` configured for React and modern JavaScript features
- **Test Files**: All test files use `.test.tsx` extension with full TypeScript support
- **Migration Complete**: Successfully migrated from Jest to Vitest with full TypeScript support

### Health Monitoring

The application includes a comprehensive health monitoring system accessible at `/health`:

- **GitHub Actions Integration**: View recent workflow runs and deployment status
- **DigitalOcean Infrastructure**: Monitor droplets, load balancers, and databases
- **Service Health Checks**: Real-time monitoring of external services
- **Deployment Status**: Track application deployment and health metrics

See [Health Page Guide](docs/HEALTH_PAGE_README.md) for detailed information about the health monitoring features.

### Testing

This project maintains high test coverage with comprehensive unit tests for all components, hooks, and services.

- **Current Coverage**: 93.98%
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


## Deployment

The application is deployed to DigitalOcean using their App Platform. The deployment is automated through GitHub Actions with comprehensive testing and verification.

### Automated CI/CD Pipeline

The project includes a complete CI/CD pipeline that:
- Runs unit tests with coverage reporting
- Builds and verifies the application
- Deploys to DigitalOcean App Platform
- Runs Playwright tests against the deployed site
- Provides detailed test reports and artifacts

See [CI/CD Setup](docs/CI_SETUP.md) for detailed information about the automated testing and deployment process.

### Environment Variables

For detailed environment variable setup, see [Environment Configuration](docs/ENVIRONMENT_CONFIG.md).

**Required for basic functionality:**
- `VITE_WEATHER_API_KEY`: OpenWeatherMap API key
- `VITE_WEATHER_CITY`: Default city for weather data
- `VITE_WEATHER_UNITS`: Units for weather data (imperial/metric)

**Optional for health monitoring:**
- `VITE_GITHUB_TOKEN`: GitHub API token for health page
- `VITE_DIGITALOCEAN_TOKEN`: DigitalOcean API token for infrastructure monitoring

## Scripts

The project includes utility scripts for development and testing. All scripts are defined in `package.json` and can be run with `yarn <script-name>`.

## License

This project is licensed under the MIT License.
