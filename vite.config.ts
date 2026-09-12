import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import { defineConfig } from 'vite';
import { ViteImageOptimizer } from 'vite-plugin-image-optimizer';

export default defineConfig(() => {
  return {
    plugins: [
      react(),
      tailwindcss(),
      ViteImageOptimizer({
        includePublic: true,
        logStats: true,
        png: {
          quality: 45,
          palette: true,
          compressionLevel: 9,
        },
        jpeg: {
          quality: 40,
          progressive: true,
          mozjpeg: true,
        },
        jpg: {
          quality: 40,
          progressive: true,
          mozjpeg: true,
        },
        mozjpeg: {
          quality: 40,
          progressive: true,
        },
        webp: {
          quality: 35,
          lossless: false,
          effort: 6,
        },
        avif: {
          quality: 30,
          effort: 9,
        },
      }),
    ],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
    server: {
      allowedHosts: true as true,
      hmr: false,
      watch: process.env.DISABLE_HMR === 'true' ? null : {},
    },
  };
});
