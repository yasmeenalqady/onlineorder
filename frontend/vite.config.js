import { defineConfig } from 'vite'
import tailwindcss from '@tailwindcss/vite'
export default defineConfig(({ command }) => ({
  base: command === 'build' ? '/onlineorder/' : '/',
  plugins: [tailwindcss()],
  server: { port: 5173, strictPort: true },
  preview: { port: 4173 },
}))
