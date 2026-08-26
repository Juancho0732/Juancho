/// <reference types="vitest/config" />
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { VitePWA } from 'vite-plugin-pwa'

// GitHub Pages sirve el proyecto en /<repo>/, no en la raíz del dominio —
// el base path tiene que coincidir o todos los assets (JS, CSS, íconos,
// manifest) resuelven a 404 en producción.
const BASE_PATH = '/Marketing-metrics-/';

// https://vite.dev/config/
export default defineConfig({
  base: BASE_PATH,
  plugins: [
    react(),
    tailwindcss(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.svg', 'apple-touch-icon.png'],
      manifest: {
        name: 'Marketing Metrics',
        short_name: 'Marketing Metrics',
        description: 'Calcula, compara y entiende tus métricas de marketing y financieras.',
        lang: 'es',
        start_url: BASE_PATH,
        scope: BASE_PATH,
        display: 'standalone',
        orientation: 'any',
        background_color: '#f7f7f8',
        theme_color: '#f7f7f8',
        icons: [
          { src: 'pwa-192.png', sizes: '192x192', type: 'image/png', purpose: 'any' },
          { src: 'pwa-512.png', sizes: '512x512', type: 'image/png', purpose: 'any' },
          { src: 'pwa-512-maskable.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
        ],
      },
      workbox: {
        // Sin backend: todos los datos viven en IndexedDB del dispositivo. El único
        // trabajo del service worker es cachear el shell de la app para que abra offline.
        globPatterns: ['**/*.{js,css,html,svg,png,ico}'],
        navigateFallback: `${BASE_PATH}index.html`,
      },
    }),
  ],
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./src/test/setup.ts'],
  },
})
