import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  assetsInclude: ['**/*.hdr'],  // Include .hdr files as assets
  server: {
    host: true,  // Allow external access
  },
})
