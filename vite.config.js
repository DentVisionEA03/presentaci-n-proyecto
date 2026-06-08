import { defineConfig } from 'vite'
import react, { reactCompilerPreset } from '@vitejs/plugin-react'
import babel from '@rolldown/plugin-babel'

/**
 * CORRECCIONES en la configuración del proxy:
 *
 * PROBLEMA 1 — onProxyReq sobreescribía el header Origin con el host de Render:
 *   proxyReq.setHeader('Origin', 'https://backend-dentvision-project.onrender.com')
 *   El backend recibía ese Origin, lo buscaba en su lista de CORS y NO lo
 *   encontraba (porque la lista tiene los orígenes del frontend, no del backend),
 *   así que rechazaba la petición.
 *   → Se eliminó el onProxyReq por completo.
 *
 * PROBLEMA 2 — El proxy solo interceptaba rutas /api, pero apiClient.js hace
 *   fetch directamente a VITE_API_URL + '/auth/login', '/citas', etc. (sin /api).
 *   El proxy nunca se activaba para esas rutas.
 *   → Se añade una segunda regla de proxy para desarrollo local que
 *     intercepta todas las rutas del backend cuando VITE_API_URL = /api-local.
 *     Ver instrucciones abajo.
 *
 * CÓMO USAR EN DESARROLLO LOCAL:
 *   1. En .env.local pon: VITE_API_URL=http://localhost:8080
 *   2. El proxy no es necesario cuando el backend corre en localhost
 *      porque el CORS del backend ya permite ese origen.
 *   3. Arranca el backend (puerto 8080) y el frontend (puerto 5174).
 *
 * CÓMO USAR CON BACKEND EN RENDER (producción):
 *   1. En .env.local pon: VITE_API_URL=https://backend-dentvision-project.onrender.com
 *   2. El backend en Render debe tener CORS_ALLOWED_ORIGINS con el dominio de tu
 *      frontend desplegado (no localhost).
 *   3. No se necesita proxy en producción — los navegadores envían el Origin real.
 */
export default defineConfig({
  plugins: [
    react(),
    babel({ presets: [reactCompilerPreset()] }),
  ],
  server: {
    host: '127.0.0.1',
    port: 5174,
  },
})
