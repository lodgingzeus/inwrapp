/// <reference types="vitest/config" />
import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

export default defineConfig({
  plugins: [react(), tailwindcss()],
  worker: { format: 'es' },
  // Listen on the LAN so other machines can open http://nixos:5173
  server: { host: true, allowedHosts: ['nixos'] },
  // TZ is fixed so hour-of-day and streak tests give the same result everywhere.
  test: { environment: 'node', include: ['src/**/*.test.ts'], env: { TZ: 'UTC' } },
})
