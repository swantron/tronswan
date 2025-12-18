# tron swan dot com

[![Test Coverage](https://img.shields.io/badge/coverage-93.98%25-brightgreen?logo=vitest&logoColor=white)](https://github.com/swantron/tronswan/actions)

<!-- Build trigger -->
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

- 🦢 **Personal Blog Integration** - Fetches posts from Hugo static site API (swantron.com)
- 🍳 **AI Recipe App** - chomptron.com - AI-powered recipe discovery using Gemini on GCP
- 🌡️ **Weather Station** - Real-time weather data for Bozeman, MT
- 🎵 **Spotify Music Player** - Full-featured Spotify integration with top tracks, artists, playlists, liked songs, and music playback (Premium required)
- ⚾ **MLB Standings** - Comprehensive MLB statistics with standings, team stats, playoff race, and rankings
- 📄 **Dynamic Resume** - Resume content dynamically loaded from Google Docs API ([see Google Docs Setup](docs/GOOGLE_DOCS_SETUP.md))
- 🎬 **Video Shorts Gallery** - Collection of video shorts with modal player
- 🎮 **Interactive Games** - FizzBuzz calculator and fun components
- 📊 **Health Monitoring** - Real-time service health and deployment status ([see Health Page Guide](docs/HEALTH_PAGE_README.md))
- 🔍 **SEO Optimization** - Comprehensive SEO with react-helmet-async for meta tags, Open Graph, and Twitter cards
- 📝 **Structured Logging** - Advanced logging system with performance tracking ([see Logging Guide](docs/LOGGING_GUIDE.md))
- 📱 **Responsive Design** - Works on all devices
- ⚡ **Fast Performance** - Optimized with modern React patterns
- 🧪 **High Test Coverage** - 93.98% test coverage with Vitest and Playwright E2E tests
- 🚀 **Automated Deployment** - CI/CD pipeline with post-deployment verification ([see CI/CD Setup](docs/CI_SETUP.md))

## Tech Stack

- **Frontend**: React 19.2, TypeScript, React Router 7.10
- **Styling**: CSS3 with CSS Variables, Responsive Design
- **SEO**: react-helmet-async for dynamic meta tags and Open Graph
- **Testing**: Vitest, React Testing Library, Playwright (E2E)
- **Build Tools**: Vite 7.1, TypeScript 5.9
- **Server**: Express.js 5.1 for production deployment
- **Deployment**: DigitalOcean App Platform
- **APIs**: 
  - Hugo JSON API (blog posts from static Hugo site)
  - OpenWeatherMap API (weather data)
  - GitHub API (CI/CD status)
  - DigitalOcean API (infrastructure monitoring)
  - Spotify Web API (music integration)
  - MLB Stats API (baseball standings)
  - Google Docs API (resume content)
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

   # Site configuration
   VITE_SITE_URL=https://tronswan.com

   # Optional: Health monitoring features
   VITE_GITHUB_TOKEN=your_github_token
   VITE_GITHUB_OWNER=swantron
   VITE_DIGITALOCEAN_TOKEN=your_digitalocean_token
   VITE_DIGITALOCEAN_APP_ID=your_digitalocean_app_id

   # Optional: Spotify integration (for music player)
   VITE_SPOTIFY_CLIENT_ID=your_spotify_client_id
   VITE_SPOTIFY_CLIENT_SECRET=your_spotify_client_secret
   VITE_SPOTIFY_REDIRECT_URI=http://localhost:5173/music/callback

   # Optional: Google Docs API (for dynamic resume)
   VITE_GOOGLE_DOCS_API_KEY=your_google_docs_api_key

   # Optional: Swantron Hugo API (for blog posts)
   VITE_SWANTRON_API_URL=https://swantron.gitlab.io/swantron
   ```

### Available Scripts

**Development:**
- `yarn dev`: Runs the app in development mode with Vite
- `yarn start`: Starts the Express production server (requires build first)
- `yarn build`: Builds the app for production with Vite
- `yarn preview`: Preview the production build locally

**Testing:**
- `yarn test`: Launches the Vitest test runner in watch mode
- `yarn test:run`: Runs tests once and exits
- `yarn test:coverage`: Runs tests with coverage reporting
- `yarn test:ui`: Launches the Vitest UI for interactive testing
- `yarn test:e2e`: Runs Playwright end-to-end tests
- `yarn test:e2e:ui`: Runs Playwright tests with UI mode
- `yarn test:e2e:headed`: Runs Playwright tests in headed browser
- `yarn test:e2e:debug`: Runs Playwright tests in debug mode
- `yarn test:all`: Runs both unit and e2e tests

**Code Quality:**
- `yarn type-check`: Runs TypeScript type checking without emitting files
- `yarn lint`: Runs ESLint to check code quality
- `yarn lint:fix`: Runs ESLint and fixes auto-fixable issues
- `yarn format`: Formats code with Prettier
- `yarn format:check`: Checks code formatting without making changes
- `yarn check-all`: Runs type-check, lint, and format:check

### Project Structure

```
src/
├── components/          # React components
│   ├── music/           # Spotify music player components
│   ├── recipe/          # AI recipe app components
│   ├── status/          # Health monitoring components
│   ├── swantron/        # Blog post components
│   ├── ui/              # UI components (Weather, MLB, Resume, etc.)
│   └── video/           # Video player components
├── services/            # API service modules
│   ├── digitalOceanService.ts  # DigitalOcean API integration
│   ├── githubService.ts        # GitHub API integration
│   ├── spotifyService.ts      # Spotify Web API integration
│   ├── spotifyPlaybackService.ts  # Spotify playback control
│   ├── googleDocsService.ts   # Google Docs API integration
│   └── swantronService.ts     # Hugo JSON API for blog posts
├── hooks/               # Custom React hooks
│   ├── useResumeData.ts       # Resume data fetching hook
│   ├── useApiRequest.ts       # API request hook
│   └── useDateFormatter.ts    # Date formatting hook
├── utils/               # Utility functions and configuration
│   ├── logger.ts        # Structured logging system
│   └── runtimeConfig.ts # Runtime configuration
├── config/              # Configuration files
│   └── logging.ts       # Logging configuration
├── types/               # TypeScript type definitions
├── data/                # Static data (study guides, etc.)
└── styles/              # CSS stylesheets

tests/                   # Test files
├── e2e/                 # Playwright end-to-end tests
├── smoke/               # Smoke tests
├── regression/          # Regression tests
├── page-objects/        # Page object models
└── fixtures/            # Test fixtures

server.js                # Express production server
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

### Key Features in Detail

#### 🎵 Spotify Music Player

A full-featured Spotify integration that provides an enhanced music experience:

- **Authentication**: OAuth 2.0 flow with Spotify
- **Top Tracks & Artists**: View your top tracks and artists with customizable time ranges (last month, 6 months, year, all time)
- **Recently Played**: See your recent listening history
- **Liked Songs**: Browse and play your entire liked songs library with pagination
- **Playlists**: View all your playlists with track listings
- **Music Playback**: Direct playback control (requires Spotify Premium)
- **Music Player Component**: Embedded player with play/pause controls
- **Currently Playing**: Real-time display of currently playing track

#### ⚾ MLB Standings

Comprehensive Major League Baseball statistics and analysis:

- **Standings View**: Current standings for all divisions (AL/NL East, Central, West)
- **Team Stats Deep Dive**: Detailed team statistics including:
  - Home vs Away records
  - Day vs Night games
  - Performance vs left/right-handed pitchers
  - Surface type (grass/turf) performance
  - Close games (extra innings, one-run games)
  - Last 10 games performance
  - Expected win-loss records
- **Playoff Race**: Wild card standings and playoff positioning
- **Rankings**: Top 10 teams ranked by:
  - Best records
  - Most runs scored
  - Fewest runs allowed
  - Best run differential
  - Hottest teams (last 10 games)
  - Best home field advantage

#### 📄 Dynamic Resume

Resume content dynamically loaded from Google Docs:

- **Google Docs Integration**: Resume content fetched from Google Docs API
- **Auto-refresh**: Content updates automatically when Google Doc is modified
- **Last Updated**: Displays when content was last fetched
- **Error Handling**: Graceful error handling with retry functionality

See [Google Docs Setup](docs/GOOGLE_DOCS_SETUP.md) for setup instructions.

#### 🎬 Video Shorts Gallery

A collection of video shorts with an interactive gallery:

- **Video Collection**: Browse through a collection of video shorts
- **Modal Player**: Click any video to play in a full-screen modal
- **Thumbnail Previews**: Video thumbnails with hover effects
- **Keyboard Navigation**: Full keyboard support for accessibility

#### 🔍 SEO Optimization

Comprehensive SEO implementation:

- **Dynamic Meta Tags**: Page-specific titles, descriptions, and keywords
- **Open Graph**: Facebook/LinkedIn sharing optimization
- **Twitter Cards**: Twitter sharing optimization
- **Structured Data**: JSON-LD structured data support
- **Canonical URLs**: Proper canonical URL handling
- **Runtime Configuration**: SEO tags configured at runtime

#### 📝 Structured Logging

Advanced logging system with performance tracking:

- **Log Levels**: Debug, Info, Warn, Error with configurable levels
- **Performance Tracking**: Measure async operation performance
- **Context Logging**: Rich context data with every log entry
- **Development Mode**: Enhanced logging in development
- **Production Mode**: Optimized logging for production

See [Logging Guide](docs/LOGGING_GUIDE.md) for detailed information.

### Testing

This project maintains high test coverage with comprehensive unit tests and end-to-end tests.

- **Current Coverage**: 93.98%
- **Unit Testing**: Vitest + React Testing Library
- **E2E Testing**: Playwright for browser automation
- **TypeScript Support**: All tests written in TypeScript with full type safety
- **Fast Execution**: Vitest provides faster test execution compared to Jest
- **Modern Tooling**: Built on Vite for optimal performance and developer experience
- **Coverage Reports**: Generated automatically as part of CI/CD pipeline
- **Coverage Badge**: Shows current test coverage percentage
- **Test Organization**: Tests organized by type (smoke, regression, e2e) with page object models

**Unit Tests:**
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

**End-to-End Tests:**
```bash
# Run Playwright E2E tests
yarn test:e2e

# Run with UI mode (interactive)
yarn test:e2e:ui

# Run in headed browser (see browser)
yarn test:e2e:headed

# Debug mode
yarn test:e2e:debug

# Run all tests (unit + e2e)
yarn test:all
```

## Deployment

The application is deployed to DigitalOcean using their App Platform. The deployment is automated through GitHub Actions with comprehensive testing and verification.

### Production Server

The application uses an Express.js server (`server.js`) for production deployment that:

- Serves static files from the Vite build
- Handles client-side routing (SPA fallback)
- Includes request logging and security middleware
- Detects and logs suspicious requests
- Provides graceful shutdown handling

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
- `VITE_WEATHER_CITY`: Default city for weather data (default: `Bozeman`)
- `VITE_WEATHER_UNITS`: Units for weather data (default: `imperial`)

**Optional features:**

- `VITE_SITE_URL`: Site URL for SEO and links (default: `https://tronswan.com`)
- `VITE_GITHUB_TOKEN`: GitHub API token for health page monitoring
- `VITE_GITHUB_OWNER`: GitHub username/organization (default: `swantron`)
- `VITE_DIGITALOCEAN_TOKEN`: DigitalOcean API token for infrastructure monitoring
- `VITE_DIGITALOCEAN_APP_ID`: DigitalOcean App Platform app ID
- `VITE_SPOTIFY_CLIENT_ID`: Spotify Client ID for music player integration
- `VITE_SPOTIFY_CLIENT_SECRET`: Spotify Client Secret for music player integration
- `VITE_SPOTIFY_REDIRECT_URI`: Spotify OAuth redirect URI (default: `/music/callback`)
- `VITE_GOOGLE_DOCS_API_KEY`: Google Docs API key for dynamic resume content
- `VITE_SWANTRON_API_URL`: Base URL for Hugo static site API (default: `https://swantron.gitlab.io/swantron`)

**Note:** The Google Docs document ID is hardcoded in the service. See [Google Docs Setup](docs/GOOGLE_DOCS_SETUP.md) for details.

## Scripts

The project includes utility scripts for development and testing. All scripts are defined in `package.json` and can be run with `yarn <script-name>`.

## License

This project is licensed under the MIT License.

