# Environment Configuration Guide

This project uses Vite environment variables with runtime configuration support for both local development and deployed environments.

## Local Development (.env file)

Create a `.env` file in the project root with the following variables:

```bash
# OpenWeatherMap API Configuration
VITE_WEATHER_API_KEY=your_openweathermap_api_key_here
VITE_WEATHER_CITY=Bozeman
VITE_WEATHER_UNITS=imperial

# Site Configuration
VITE_SITE_URL=https://tronswan.com

# GitLab CI Configuration
# Get your GitLab token from: https://gitlab.com/-/profile/personal_access_tokens
# Create a token with 'api' scope
VITE_GITLAB_TOKEN=your_gitlab_token_here
VITE_GITLAB_URL=https://gitlab.com/api/v4

# DigitalOcean Configuration
# Get your DigitalOcean token from: https://cloud.digitalocean.com/account/api/tokens
# Create a token with 'read' scope
VITE_DIGITALOCEAN_TOKEN=your_digitalocean_token_here
```

## Deployed Environment (DigitalOcean)

For deployed environments, set these as environment variables in your DigitalOcean App Platform:

### Required Variables:
- `VITE_WEATHER_API_KEY` - OpenWeatherMap API key
- `VITE_GITLAB_TOKEN` - GitLab CI token (optional, for health page)
- `VITE_DIGITALOCEAN_TOKEN` - DigitalOcean API token (optional, for health page)

### Optional Variables:
- `VITE_WEATHER_CITY` - Weather city (default: Bozeman)
- `VITE_WEATHER_UNITS` - Weather units (default: imperial)
- `VITE_SITE_URL` - Site URL (default: https://tronswan.com)
- `VITE_GITLAB_URL` - GitLab API URL (default: https://gitlab.com/api/v4)

## Runtime Configuration

The application includes a runtime configuration system that:

1. **Local Development**: Reads from `.env` file via Vite's `import.meta.env`
2. **Deployed Environment**: Can pull configuration from a runtime config endpoint
3. **Fallback**: Falls back to build-time environment variables

### How It Works

The `runtimeConfig` utility automatically:
- Initializes configuration on first use
- Tries to load runtime config from `/api/config` endpoint (for deployed environments)
- Falls back to build-time environment variables
- Provides type-safe access to configuration values

### Usage in Components

```typescript
import { runtimeConfig } from '../utils/runtimeConfig';

// Initialize config (usually done automatically)
await runtimeConfig.initialize();

// Get a required value
const apiKey = runtimeConfig.get('VITE_WEATHER_API_KEY');

// Get a value with default
const city = runtimeConfig.getWithDefault('VITE_WEATHER_CITY', 'Bozeman');

// Check if a value is set
if (runtimeConfig.has('VITE_GITLAB_TOKEN')) {
  // Use GitLab integration
}
```

## API Token Setup

### OpenWeatherMap API Key
1. Go to [OpenWeatherMap API Keys](https://openweathermap.org/api_keys)
2. Sign up for a free account
3. Generate an API key
4. Add it as `VITE_WEATHER_API_KEY`

### GitLab CI Token (Optional)
1. Go to [GitLab Personal Access Tokens](https://gitlab.com/-/profile/personal_access_tokens)
2. Create a new token with `api` scope
3. Add it as `VITE_GITLAB_TOKEN`

### DigitalOcean Token (Optional)
1. Go to [DigitalOcean API Tokens](https://cloud.digitalocean.com/account/api/tokens)
2. Generate a new token with `read` scope
3. Add it as `VITE_DIGITALOCEAN_TOKEN`

## Migration from React App

If migrating from Create React App, update these variable names:
- `REACT_APP_API_KEY` → `VITE_WEATHER_API_KEY`
- `REACT_APP_CITY` → `VITE_WEATHER_CITY`
- `REACT_APP_UNITS` → `VITE_WEATHER_UNITS`
- `REACT_APP_SITE_URL` → `VITE_SITE_URL`
- `REACT_APP_GITLAB_TOKEN` → `VITE_GITLAB_TOKEN`
- `REACT_APP_GITLAB_URL` → `VITE_GITLAB_URL`
- `REACT_APP_DIGITALOCEAN_TOKEN` → `VITE_DIGITALOCEAN_TOKEN`

## Troubleshooting

### Local Development Issues
- Ensure `.env` file is in the project root
- Restart the development server after changing `.env` file
- Check that variable names start with `VITE_`
- Weather variables should use `VITE_WEATHER_` prefix

### Deployed Environment Issues
- Verify environment variables are set in DigitalOcean App Platform
- Check that variables are prefixed with `VITE_`
- Ensure the runtime config endpoint is accessible (if using custom config endpoint)

### Runtime Config Issues
- Check browser console for configuration loading errors
- Verify that the config endpoint returns valid JSON (if using custom endpoint)
- Ensure fallback to build-time variables is working
