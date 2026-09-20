/// <reference types="vitest" />
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      '@shared': path.resolve(__dirname, '../shared')
    }
  },
  server: {
    port: 5173,
    host: true
  },
  test: {
    environment: 'jsdom',
    globals: true,
    // Unit tests must run fully offline against the in-memory mock store,
    // never against the deployed API Gateway backend.
    env: {
      VITE_USE_MOCKS: 'true'
    }
  }
});
