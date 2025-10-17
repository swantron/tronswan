import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  resolve: {
    conditions: ['development', 'browser'],
  },
  define: {
    'process.env.NODE_ENV': JSON.stringify('test'),
  },
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./src/setupTests.ts'],
    exclude: [
      '**/node_modules/**',
      '**/dist/**',
      '**/cypress/**',
      '**/tests/**', // Exclude Playwright tests directory
      '**/.{idea,git,cache,output,temp}/**',
      '**/{karma,rollup,webpack,vite,vitest,jest,ava,babel,nyc,cypress,tsup,build}.config.*',
      '**/tronswan.test.js' // Exclude Playwright test file
    ],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'lcov', 'html', 'json-summary'],
      reportsDirectory: './coverage',
      include: [
        'src/**/*.{ts,tsx}',
        '!src/index.tsx',
        '!src/reportWebVitals.ts',
        '!src/setupTests.ts',
        '!src/types/**' // Exclude type definitions
      ],
      thresholds: {
        global: {
          statements: 70,
          branches: 60,
          functions: 60,
          lines: 70
        }
      }
    }
  }
})
