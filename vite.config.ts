/// <reference types="vitest/config" />
import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'
import { defineConfig, type Plugin } from 'vite'

/**
 * Link previews need absolute URLs. SITE_URL wins (for a custom domain); on Vercel the
 * production domain is used automatically. Locally the URLs stay relative.
 */
function siteUrl(): Plugin {
  const vercel = process.env.VERCEL_PROJECT_PRODUCTION_URL
  const url = (process.env.SITE_URL ?? (vercel ? `https://${vercel}` : '')).replace(/\/$/, '')
  return {
    name: 'site-url',
    transformIndexHtml: (html) => html.replaceAll('__SITE_URL__', url),
  }
}

export default defineConfig({
  plugins: [react(), tailwindcss(), siteUrl()],
  worker: { format: 'es' },
  // Listen on the LAN so other machines can open http://nixos:5173
  server: { host: true, allowedHosts: ['nixos'] },
  // TZ is fixed so hour-of-day and streak tests give the same result everywhere.
  test: { environment: 'node', include: ['src/**/*.test.ts'], env: { TZ: 'UTC' } },
})
