import vue from '@vitejs/plugin-vue'
import { defineConfig } from 'vite'

export default defineConfig({
  plugins: [vue()],
  define: {
    global: 'globalThis',
  },
  optimizeDeps: {
    include: [
      'isomorphic-git',
      'isomorphic-git/http/web',
      '@isomorphic-git/lightning-fs',
    ],
  },
  server: {
    port: 5177,
    strictPort: false,
  },
})
