/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_WEATHER_API_KEY: string
  readonly VITE_WEATHER_CITY: string
  readonly VITE_WEATHER_UNITS: string
  readonly VITE_SITE_URL: string
  readonly VITE_GITLAB_TOKEN: string
  readonly VITE_GITLAB_URL: string
  readonly VITE_DIGITALOCEAN_TOKEN: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
