import reactRefresh from '@vitejs/plugin-react-refresh';
import { defineConfig } from 'vite';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [reactRefresh()],
  server: {
    proxy: {
      // '/api': 'http://localhost:5000',
    },
  },
  build: {
    outDir: './build',
  },
});
