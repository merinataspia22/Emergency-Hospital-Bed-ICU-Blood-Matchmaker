import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
  ],
  server: {
    proxy: {
      // Member 2: donor ar message API alada server e (5001). "/api" er AGE thakte hobe.
      "/api/donors": {
        target: "http://127.0.0.1:5001",
        changeOrigin: true,
      },
      "/api/messages": {
        target: "http://127.0.0.1:5001",
        changeOrigin: true,
      },
      "/api": {
        target: "http://127.0.0.1:5000",
        changeOrigin: true,
      },
    },
  },
})