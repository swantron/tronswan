/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_WEATHER_API_KEY: string
  readonly VITE_WEATHER_CITY: string
  readonly VITE_WEATHER_UNITS: string
  readonly VITE_SITE_URL: string
  readonly VITE_GITHUB_TOKEN: string
  readonly VITE_GITHUB_OWNER: string
  readonly VITE_DIGITALOCEAN_TOKEN: string
  readonly VITE_DIGITALOCEAN_APP_ID: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
