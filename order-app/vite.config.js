import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'



// vite.config.js
export default defineConfig({
  base: '/loginfrontend/', // Must match your Vercel project name
  build: {
    emptyOutDir: true
  }
});
