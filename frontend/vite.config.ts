import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      // changeOrigin is deliberately omitted: keeping the original Host header
      // (localhost:5173) makes the request genuinely same-origin from Django's
      // point of view, so its CSRF Origin check passes without needing
      // CSRF_TRUSTED_ORIGINS in dev.
      '/api': { target: 'http://127.0.0.1:8000' },
      '/django-admin': { target: 'http://127.0.0.1:8000' },
      '/static': { target: 'http://127.0.0.1:8000' },
      '/media': { target: 'http://127.0.0.1:8000' },
    },
  },
})
