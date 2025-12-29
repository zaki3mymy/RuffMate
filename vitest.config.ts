import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      '@components': path.resolve(__dirname, './src/components'),
      '@services': path.resolve(__dirname, './src/services'),
      '@store': path.resolve(__dirname, './src/store'),
      '@hooks': path.resolve(__dirname, './src/hooks'),
      '@types': path.resolve(__dirname, './src/types'),
      '@utils': path.resolve(__dirname, './src/utils'),
      '@styles': path.resolve(__dirname, './src/styles'),
      '@assets': path.resolve(__dirname, './src/assets'),
    },
  },
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./tests/setup.ts'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html', 'lcov'],
      reportsDirectory: './coverage',
      exclude: [
        'node_modules/',
        'dist/',
        '**/*.d.ts',
        '**/*.config.*',
        'coverage/',
        'tests/fixtures/',
        'tests/__mocks__/',
        'tests/helpers/**',
        'src/vite-env.d.ts',
        'src/main.tsx',
        'src/types/**',
        'scripts/**',
      ],
      all: true,
      thresholds: {
        branches: 94,
        functions: 95,
        lines: 95,
        statements: 95,
      },
    },
    pool: 'threads',
    poolOptions: {
      threads: {
        maxThreads: 4,
        minThreads: 2,
      },
    },
  },
});
