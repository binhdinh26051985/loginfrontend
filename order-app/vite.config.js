import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'


export default defineConfig({
  base: '/loginfrontend/', // Must match your GitHub repo name exactly
  plugins: [react()]
})
