import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  build: {
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('node_modules')) {
            if (id.includes('react') || id.includes('react-dom') || id.includes('react-router')) {
              return 'react-vendor';
            }
            if (id.includes('@apollo/client') || id.includes('graphql')) {
              return 'apollo-vendor';
            }
            if (id.includes('lucide-react') || id.includes('recharts') || id.includes('qrcode') || id.includes('canvas-confetti')) {
              return 'ui-vendor';
            }
            if (id.includes('react-window') || id.includes('react-lazy-load-image-component')) {
              return 'react-components';
            }
            return 'vendor';
          }
        },
      },
    },
    chunkSizeWarningLimit: 1000,
  },
})
