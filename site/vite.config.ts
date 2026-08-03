import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';

export default defineConfig({
  base: '/7langs-7projects/',
  plugins: [react()],
  build: {
    target: 'es2022',
  },
});
