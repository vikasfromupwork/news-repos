import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { VitePWA } from 'vite-plugin-pwa'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    vue(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.ico', 'robots.txt', 'apple-touch-icon.png'],
      devOptions: {
        enabled: true, // enable PWA in dev so you can test install
        type: 'module',
      },
      strategies: 'injectManifest',
      srcDir: 'src',
      filename: 'sw.js',
      manifest: {
        id: '/news-repos-v2',
        scope: '/',
        name: 'News Repos',
        short_name: 'NewsRepos',
        description: 'News Repos PWA demo.',
        theme_color: '#f9c400',
        background_color: '#ffffff',
        display: 'standalone',
        start_url: '/',
        icons: [
          {
            src: '/news-icon.svg',
            sizes: '512x512',
            type: 'image/svg+xml',
          },
        ],
        share_target: {
          action: '/share-target',
          method: 'GET',
          params: {
            title: 'title',
            text: 'text',
            url: 'url',
          },
        },
      },
    }),
  ],
  server: {
    host: true, // listen on all network interfaces
    port: 5173,
  },
  preview: {
    host: true,
    port: 4173,
    // allow ngrok (and similar) hosts to access preview
    allowedHosts: true,
  },
})
