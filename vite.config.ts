import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// Дев-сервер отдаёт фронтенд, а запросы к API и к аудио проксирует на бэкенд.
export default defineConfig({
  plugins: [react()],
  build: {
    /**
     * Без этого минификатор переписывает «@media (max-width: 600px)» в новый
     * синтаксис диапазонов «@media (width<=600px)». Его не понимает Safari
     * до 16.4 — старый айфон молча пропускает весь блок, и мобильные правила
     * не применяются. Указываем старые цели, чтобы медиа-запросы остались
     * в классическом виде.
     */
    cssTarget: ['chrome87', 'safari14', 'firefox78', 'edge88'],
    /*
     * Порог предупреждения о размере. Стандартные 500 КБ рассчитаны на
     * маленькие сайты без готового набора элементов; у нас в общий файл
     * входит библиотека оформления, которая нужна на каждой странице.
     */
    chunkSizeWarningLimit: 700,
  },
  server: {
    proxy: {
      '/api': { target: 'http://localhost:4000', changeOrigin: true },
      '/media': { target: 'http://localhost:4000', changeOrigin: true },
    },
  },
});
