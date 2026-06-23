import { defineConfig } from 'vite'
import preact from '@preact/preset-vite'
import tailwindcss from '@tailwindcss/vite'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  base: '/brew-tiful-pwa/',
  plugins: [
    preact({
      prefreshEnabled: true,
    }),
    tailwindcss(),
    VitePWA({
      registerType: 'prompt',
      includeAssets: ['favicon.svg', 'favicon.png', 'icon-192.png', 'icon-192.png', 'icon-512.svg', 'icon-512.png', 'apple-touch-icon.svg', 'apple-touch-icon.png'],
      manifest: {
        name: 'Brew-tiful',
        short_name: 'Brews',
        description: 'Guided coffee brewing recipes',
        theme_color: '#000000',
        background_color: '#000000',
        display: 'standalone',
        orientation: 'portrait-primary',
        scope: '/brew-tiful-pwa/',
        start_url: '/brew-tiful-pwa/',
        icons: [
          {
            src: 'icon-192.png',
            sizes: '192x192',
            type: 'image/png',
          },
          {
            src: 'icon-512.png',
            sizes: '512x512',
            type: 'image/png',
          },
          {
            src: 'icon-512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'maskable',
          },
        ],
        shortcuts: [
          {
            name: 'Start Brew',
            short_name: 'Brew',
            description: 'Quick-start a brew',
            url: '/brew-tiful-pwa/?action=brew',
            icons: [{ src: 'icon-192.png', sizes: '96x96' }],
          },
          {
            name: 'View Recipes',
            short_name: 'Recipes',
            description: 'Browse recipes',
            url: '/brew-tiful-pwa/?action=recipes',
            icons: [{ src: 'icon-192.png', sizes: '96x96' }],
          },
        ],
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg,woff2,json}'],
        runtimeCaching: [
          {
            urlPattern: /^https:\/\/fonts\.googleapis\.com\/.*/i,
            handler: 'CacheFirst',
            options: {
              cacheName: 'google-fonts-cache',
              expiration: { maxEntries: 10, maxAgeSeconds: 60 * 60 * 24 * 365 },
            },
          },
        ],
      },
    }),
  ],
  resolve: {
    alias: {
      react: 'preact/compat',
      'react-dom': 'preact/compat',
    },
  },
})
