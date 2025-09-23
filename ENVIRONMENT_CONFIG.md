# Environment Configuration Guide

This project uses Vite environment variables with runtime configuration support for both local development and deployed environments.

## Local Development (.env file)

Create a `.env` file in the project root with the following variables. You can also create a `.env.example` file with these same variables (without the actual values) to share with your team:

```bash
# OpenWeatherMap API Configuration
VITE_WEATHER_API_KEY=your_openweathermap_api_key_here
VITE_WEATHER_CITY=Bozeman
VITE_WEATHER_UNITS=imperial

# Site Configuration
VITE_SITE_URL=https://tronswan.com

# GitHub Configuration
# Get your GitHub token from: https://github.com/settings/tokens
# Create a fine-grained token with repository access
VITE_GITHUB_TOKEN=your_github_token_here
VITE_GITHUB_OWNER=swantron

# DigitalOcean Configuration
# Get your DigitalOcean token from: https://cloud.digitalocean.com/account/api/tokens
# Create a token with 'read' scope
VITE_DIGITALOCEAN_TOKEN=your_digitalocean_token_here
VITE_DIGITALOCEAN_APP_ID=0513ce4c-b074-4139-bb38-a1c6a5bc97a6

# Google Docs API Configuration
# Get your Google Docs API key from: https://console.cloud.google.com/
# See GOOGLE_DOCS_SETUP.md for detailed setup instructions
VITE_GOOGLE_DOCS_API_KEY=your_google_docs_api_key_here
```

## Deployed Environment (DigitalOcean)

For deployed environments, set these as environment variables in your DigitalOcean App Platform:

### Required Variables:
- `VITE_WEATHER_API_KEY` - OpenWeatherMap API key
- `VITE_GITHUB_TOKEN` - GitHub token (optional, for health page)
- `VITE_DIGITALOCEAN_TOKEN` - DigitalOcean API token (optional, for health page)

### Optional Variables:
- `VITE_WEATHER_CITY` - Weather city (default: Bozeman)
- `VITE_WEATHER_UNITS` - Weather units (default: imperial)
- `VITE_SITE_URL` - Site URL (default: https://tronswan.com)
- `VITE_GITHUB_OWNER` - GitHub username/organization (default: swantron)

## Configuration System

The application uses a simple configuration system that:

1. **Local Development**: Reads from `.env` file via Vite's `import.meta.env`
2. **Deployed Environment**: Uses environment variables set in DigitalOcean App Platform

### How It Works

The `runtimeConfig` utility automatically:
- Initializes configuration on first use
- Loads environment variables from Vite's `import.meta.env`
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
if (runtimeConfig.has('VITE_GITHUB_TOKEN')) {
  // Use GitHub integration
}
```

## API Token Setup

### OpenWeatherMap API Key
1. Go to [OpenWeatherMap API Keys](https://openweathermap.org/api_keys)
2. Sign up for a free account
3. Generate an API key
4. Add it as `VITE_WEATHER_API_KEY`

### GitHub Token (Optional)
**Classic Personal Access Token**
1. Go to [GitHub Personal Access Tokens](https://github.com/settings/tokens)
2. Click **"Generate new token"** → **"Generate new token (classic)"**
3. Fill in:
   - **Note**: `tronswan-health-monitor`
   - **Expiration**: Choose an appropriate expiration (e.g., 1 year)
   - **Scopes**: Check the following scopes:
     - **`actions`** - Access GitHub Actions
     - **`metadata`** - Access repository metadata
     - **`contents`** - Access repository contents
4. Click **"Generate token"**
5. Copy the token and add it as `VITE_GITHUB_TOKEN`

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
- `REACT_APP_GITHUB_TOKEN` → `VITE_GITHUB_TOKEN`
- `REACT_APP_GITHUB_OWNER` → `VITE_GITHUB_OWNER`
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
- Ensure variables are properly configured in your DigitalOcean app settings

## .env.example File

Create a `.env.example` file in your project root with the following content to share with your team:

```bash
# Vite Environment Variables
# Copy this file to .env and fill in your actual values

# OpenWeatherMap API Configuration
VITE_WEATHER_API_KEY=your_openweathermap_api_key_here
VITE_WEATHER_CITY=Bozeman
VITE_WEATHER_UNITS=imperial

# Site Configuration
VITE_SITE_URL=https://tronswan.com

# GitHub Configuration
# Get your GitHub token from: https://github.com/settings/tokens
# Create a fine-grained token with repository access
VITE_GITHUB_TOKEN=your_github_token_here
VITE_GITHUB_OWNER=swantron

# DigitalOcean Configuration
# Get your DigitalOcean token from: https://cloud.digitalocean.com/account/api/tokens
# Create a token with 'read' scope
VITE_DIGITALOCEAN_TOKEN=your_digitalocean_token_here
VITE_DIGITALOCEAN_APP_ID=0513ce4c-b074-4139-bb38-a1c6a5bc97a6

# Google Docs API Configuration
# Get your Google Docs API key from: https://console.cloud.google.com/
# See GOOGLE_DOCS_SETUP.md for detailed setup instructions
VITE_GOOGLE_DOCS_API_KEY=your_google_docs_api_key_here
```