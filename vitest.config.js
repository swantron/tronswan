import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./src/setupTests.js'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'lcov', 'html', 'json-summary'],
      reportsDirectory: './coverage',
      include: [
        'src/**/*.{js,jsx}',
        '!src/index.js',
        '!src/reportWebVitals.js',
        '!src/setupTests.js'
      ],
      thresholds: {
        global: {
          statements: 80,
          branches: 70,
          functions: 75,
          lines: 80
        }
      }
    }
  }
})
