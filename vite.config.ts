import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// Дев-сервер отдаёт фронтенд, а запросы к API и к аудио проксирует на бэкенд.
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/api': { target: 'http://localhost:4000', changeOrigin: true },
      '/media': { target: 'http://localhost:4000', changeOrigin: true },
    },
  },
});
