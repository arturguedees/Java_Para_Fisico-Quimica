import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// Configuração estável do Vite
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    host: true
  }
});
