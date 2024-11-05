import { defineConfig } from 'vite';
import path from 'path';

export default defineConfig({
  server: {
    https: {
      key: './server.key',
      cert: './server.cert',
    },
    host: '0.0.0.0',
    port: 5173,
  },
  esbuild: {
    target: 'es2022'
  },
  build: {
    target: 'es2022',
    rollupOptions: {
      input: {
        main: path.resolve(__dirname, 'index.html'),
        spatialroom: path.resolve(__dirname, 'spatial-room.html'),
      }
    }
  }
});
