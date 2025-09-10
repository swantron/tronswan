/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_API_KEY: string
  readonly VITE_CITY: string
  readonly VITE_UNITS: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
