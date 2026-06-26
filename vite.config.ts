import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// Served as a GitHub Pages project site at /castles-of-burgundy-scorer/.
// (The repo name supplies that path segment, so base must match.)
export default defineConfig({
  plugins: [react()],
  base: '/castles-of-burgundy-scorer/',
})
