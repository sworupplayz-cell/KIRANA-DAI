import { defineConfig } from 'vite';

export default defineConfig({
  server: {
    host: '0.0.0.0',
    allowedHosts: true,
  },
  preview: {
    host: '0.0.0.0',
    allowedHosts: true,
  },
  build: {
    target: 'es2020',
    sourcemap: true,
    rollupOptions: {
      // Keep conversion QA isolated from the normal game entry point.
      input: ['index.html', 'supermarket-assets.html'],
    },
    // Three.js renderer code is large uncompressed; monitor the gzip size too.
    chunkSizeWarningLimit: 650,
  },
});
