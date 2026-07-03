import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import Icons from 'unplugin-icons/vite'

export default defineConfig({
  plugins: [vue(), Icons({ compiler: 'vue3' })],
  server: {
    port: 5173,
    proxy: {
      '/api': {
        target: process.env.FTMS_SITE_URL || 'http://127.0.0.1:8000',
        changeOrigin: true,
        secure: false,
      },
      '/assets': {
        target: process.env.FTMS_SITE_URL || 'http://127.0.0.1:8000',
        changeOrigin: true,
        secure: false,
      },
    },
  },
})
