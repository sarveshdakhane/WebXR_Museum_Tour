import { defineConfig } from 'vite';

export default defineConfig({
  server: {
    https: {
      key: './server.key',
      cert: './server.cert',
    },
    host: '0.0.0.0',
    port: 5173,
  },
});
