import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import istanbul from 'vite-plugin-istanbul';

export default defineConfig({
  plugins: [
    react(),
    istanbul({
      include: 'src/*',
      exclude: ['node_modules', 'cypress/'],
      extension: ['.js', '.jsx', '.ts', '.tsx'],
      requireEnv: false,
    }),
  ],
  server:{
    port: 8017,
    host: "0.0.0.0"
  },
});