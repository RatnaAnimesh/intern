import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import basicSsl from '@vitejs/plugin-basic-ssl'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig(({ mode }) => ({
  base: '/intern/',
  plugins: [
    react(),
    tailwindcss(),
    // Only use SSL in development
    mode === 'development' ? basicSsl() : null,
  ].filter(Boolean),
  server: {
    port: 5173,
    host: '127.0.0.1'
  },
  build: {
    outDir: 'dist',
    sourcemap: true,
  }
}))
