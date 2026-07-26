import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { TanStackRouterVite } from '@tanstack/router-vite-plugin'
import path from 'path'

// https://vitejs.dev/config/
export default defineConfig({
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src')
    }
  },
  plugins: [
    react(),
    TanStackRouterVite()
  ],
  server: {
    host: true,
    port: 5173,
    watch: {
      usePolling: true
    },
    proxy: {
      '/token': { target: 'http://api:8000', changeOrigin: true, autoRewrite: true },
      '/users': { target: 'http://api:8000', changeOrigin: true, autoRewrite: true },
      '/device': { target: 'http://api:8000', changeOrigin: true, autoRewrite: true },
      '/data': { target: 'http://api:8000', changeOrigin: true, autoRewrite: true },
      '/datasheet': { target: 'http://api:8000', changeOrigin: true, autoRewrite: true },
      '/gedung': { target: 'http://api:8000', changeOrigin: true, autoRewrite: true },
      '/kampus': { target: 'http://api:8000', changeOrigin: true, autoRewrite: true },
      '/unit': { target: 'http://api:8000', changeOrigin: true, autoRewrite: true },
      '/powermeter': { target: 'http://api:8000', changeOrigin: true, autoRewrite: true },
      '/tarif-listrik': { target: 'http://api:8000', changeOrigin: true, autoRewrite: true },
      '/roles': { target: 'http://api:8000', changeOrigin: true, autoRewrite: true },
    }
  }
})
