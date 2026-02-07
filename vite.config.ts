import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  base: './',
  server: {
    host: true, // listen on all interfaces (phone on same Wi‑Fi or USB tether can reach)
    port: 5173, // stable port; use this in README and firewall rules
    strictPort: false, // allow next port if 5173 is in use
  },
})
