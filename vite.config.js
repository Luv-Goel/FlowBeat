import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    host: '127.0.0.1', // Must match Spotify redirect URI exactly (IPv4, not localhost/::1)
    port: 5173,
  },
})
