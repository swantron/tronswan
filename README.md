# tron swan dot com

[![Test Coverage](https://img.shields.io/badge/coverage-93.98%25-brightgreen?logo=vitest&logoColor=white)](https://github.com/swantron/tronswan/actions)
[![Build Status](https://github.com/swantron/tronswan/workflows/react%20app%20CI:CD%20with%20playwright/badge.svg)](https://github.com/swantron/tronswan/actions)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

building / deploying / learning

**Live Demo**: [tronswan.com](https://tronswan.com)

## Features

- 🍳 **Chomptron** — AI-powered recipe generator via Google Gemini. Connects to [chomptron.com](https://chomptron.com)
- 🔧 **Wrenchtron** — Vehicle maintenance tracker with smart scheduling, NHTSA recall lookup, and offline PWA. Lives at [wrenchtron.com](https://wrenchtron.com)
- 🦢 **Swantron** — Personal blog feed from [swantron.com](https://swantron.com) with search and pagination
- 🎵 **Spotify Music Player** — Top tracks, artists, playlists, liked songs, recently played, and playback control (Premium required)
- ⚾ **MLB** — Live standings, team stat splits, playoff race with elimination numbers, and top-10 rankings
- 🌡️ **Weathertron** — Real-time weather and 5-day forecast. Autocomplete city search, °F/°C/K toggle
- 📄 **Resume** — Content dynamically loaded from Google Docs API ([setup guide](docs/GOOGLE_DOCS_SETUP.md))
- 🎬 **Shorts** — Gallery of video shorts with modal player
- 📊 **Status** — Service health dashboard with live API checks, GitHub Actions deployment status, and DigitalOcean monitoring ([guide](docs/HEALTH_PAGE_README.md))
- 🏠 **Home** — Hub page; clicking the logo navigates to a random video short

## Tech Stack

- **Frontend**: React 19.2, TypeScript, React Router 7.10
- **Styling**: CSS3 with CSS Variables, Responsive Design
- **SEO**: react-helmet-async for dynamic meta tags and Open Graph
- **Testing**: Vitest, React Testing Library, Playwright (E2E)
- **Build Tools**: Vite 7.1, TypeScript 5.9
- **Server**: Express.js 5.1 for production deployment
- **Deployment**: DigitalOcean App Platform
- **APIs**: Hugo JSON API, OpenWeatherMap, GitHub, DigitalOcean, Spotify Web API, MLB Stats, Google Docs
- **Package Manager**: Yarn
- **CI/CD**: Buildkite (dynamic pipeline, GCP agents) + GitHub Actions (deploy gating, Playwright E2E)

## Getting Started

### Prerequisites

- Node.js (v24 or higher)
- Yarn package manager

### Installation

```bash
git clone https://github.com/swantron/tronswan.git
cd tronswan
yarn install
```

Create a `.env` file — see [Environment Configuration](docs/ENVIRONMENT_CONFIG.md) for the full list. Minimum for local dev:

```bash
VITE_WEATHER_API_KEY=your_openweathermap_api_key
VITE_WEATHER_CITY=Bozeman
VITE_WEATHER_UNITS=imperial
VITE_SITE_URL=https://tronswan.com
```

### Scripts

```bash
yarn dev           # development server
yarn build         # TypeScript check + Vite build
yarn test --run    # unit tests (Vitest)
yarn test:coverage # tests with coverage
yarn lint          # ESLint
yarn type-check    # TypeScript without emitting
yarn test:e2e      # Playwright E2E tests
```

## Buildkite Pipeline

This repo uses a **dynamic Buildkite pipeline** at `.buildkite/pipeline.yml` running on a self-hosted GCP agent from [buildkite-gcp-agent](https://github.com/swantron/buildkite-gcp-agent).

`.buildkite/generate-pipeline.sh` inspects which files changed and emits only the relevant steps:

```
Push / PR
  └── Generate Pipeline
        └── generate-pipeline.sh | buildkite-agent pipeline upload
              └── src/** changed         → Lint + Type-check (Tier 1)
                  components/hooks/...   → Unit tests + coverage (Tier 2)
                  config/deps or main    → Build (Tier 3)
                  always                 → Annotate result
```

| Tier | Steps | Triggers |
|------|-------|---------|
| 1 | Lint, Type-check | Any `src/` change |
| 2 | Unit tests + coverage | `components/`, `hooks/`, `services/`, `utils/` |
| 3 | Build | Config/dependency changes or push to `main` |
| — | Annotate | Always |

E2E tests run against the live DigitalOcean deployment via GHA — kept out of Buildkite as a security boundary.

All steps target `queue: gcp`.

## Deployment

Deployed to DigitalOcean App Platform via GitHub Actions. The Express server (`server.js`) serves the Vite build with SPA fallback routing. See [CI/CD Setup](docs/CI_SETUP.md) for details.

## License

MIT
