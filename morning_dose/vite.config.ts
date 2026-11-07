import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    // Forward API calls to the Flask backend (backend/backend.py) during `npm run dev`
    proxy: {
      '/api': 'http://127.0.0.1:5000',
    },
  },
})
