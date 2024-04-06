import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import utools from 'vite-plugin-utools'
import path from 'path'

// https://vitejs.dev/config/
export default defineConfig({
  base: './',
  build: {
    outDir: 'dist/',
    rollupOptions: {
      external: ['electron']
    }
  },
  define: {
    __VUE_PROD_HYDRATION_MISMATCH_DETAILS__: 'true'
  },
  plugins: [
    vue({
      script: {
        propsDestructure: true
      }
    }),
    utools({
      external: 'utools-api',
      preload: {
        path: './src/preload.ts',
        watch: false,
        name: 'window.preload'
      },
      buildUpx: false
    })
  ],
  resolve: {
    alias: [
      {
        find: '@',
        replacement: path.resolve(__dirname, './src')
      }
    ]
  }
})
