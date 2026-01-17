import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  base: "/PolyprimeV2.0/",  // <--- ADD THIS LINE (Make sure it matches your Repo name exactly)
})
