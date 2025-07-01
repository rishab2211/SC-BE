import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/resource': {
        target: 'https://sc-be.vercel.app',
        changeOrigin: true,
        secure: true
      }
    }
  }
})
