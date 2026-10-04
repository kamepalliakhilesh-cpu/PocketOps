import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  // Relative base path ensures assets resolve correctly on GitHub Pages (/pocketops/), custom domains, or local preview
  base: './',
})
