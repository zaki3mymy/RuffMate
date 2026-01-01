import { defineConfig } from 'vite'

// Vitest configuration only (Astro handles the build)
export default defineConfig({
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./tests/setup.ts'],
  },
})
