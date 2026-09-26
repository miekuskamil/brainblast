import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      // 'prompt', not 'autoUpdate': a new version waits for a "Reload" tap
      // (src/app/pwa.js + UpdateToast) instead of swapping mid-round.
      registerType: 'prompt',
      // Registration is done by hand in src/app/pwa.js (http(s) only).
      injectRegister: false,
      includeAssets: ['icon.svg'],
      // The one and only manifest (there is no public/manifest.json).
      manifest: {
        name: 'Brain Blast',
        short_name: 'Brain Blast',
        description: 'Maths and literacy practice for P7 and S1',
        lang: 'en-GB',
        theme_color: '#5b5bd6',
        background_color: '#f4f5fb',
        display: 'standalone',
        start_url: '.',
        icons: [
          { src: 'icon.svg', sizes: 'any', type: 'image/svg+xml', purpose: 'any maskable' },
        ],
      },
      // No runtime caching: the app makes no network requests at all. Web
      // fonts are deliberately not loaded (offline-first; the CSS uses
      // installed fonts — see the F6 section of app.css), so there is nothing
      // from Google Fonts to cache.
      workbox: {
        globPatterns: ['**/*.{js,css,html,svg,png,woff2}'],
      },
    }),
  ],
  test: { environment: 'node' },
});
