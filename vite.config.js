import { defineConfig } from 'vite'

export default defineConfig({
  base: '/heavy-machine-gun/', // GitHub Pages路径
  server: {
    host: '0.0.0.0',
    port: 3000,
    open: true
  },
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
    sourcemap: true
  },
  optimizeDeps: {
    include: ['phaser']
  }
})
