import { defineConfig } from 'vite'
import react, { reactCompilerPreset } from '@vitejs/plugin-react'
import babel from '@rolldown/plugin-babel'

const backendTarget = process.env.VITE_API_URL || 'https://backend-dentvision-project.onrender.com'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    babel({ presets: [reactCompilerPreset()] }),
  ],
  server: {
    host: '127.0.0.1',
    port: 5174,
    proxy: {
      '/api': {
        target: backendTarget,
        changeOrigin: true,
        secure: backendTarget.startsWith('https://'),
        rewrite: (path) => path.replace(/^\/api/, ''),
        onProxyReq: (proxyReq) => {
          if (backendTarget.startsWith('https://')) {
            proxyReq.setHeader('Origin', backendTarget)
          }
        },
      },
    },
  },
})
