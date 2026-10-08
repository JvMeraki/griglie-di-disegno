import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import path from 'node:path'
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      '@': path.resolve(import.meta.dirname, 'src'),
      '@components': path.resolve(import.meta.dirname, 'src/components'),
      '@domain': path.resolve(import.meta.dirname, 'src/domain'),
      '@hooks': path.resolve(import.meta.dirname, 'src/hooks'),
      '@i18n': path.resolve(import.meta.dirname, 'src/i18n'),
      '@rendering': path.resolve(import.meta.dirname, 'src/rendering'),
    },
  },
})
