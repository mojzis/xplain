import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [react(), tailwindcss()],
  base: '/xplain/',
  server: {
    allowedHosts: ['quasar-otter.exe.xyz'],
  },
})
