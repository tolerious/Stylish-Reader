import { fileURLToPath, URL } from 'node:url'

import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import vueJsx from '@vitejs/plugin-vue-jsx'
import vueDevTools from 'vite-plugin-vue-devtools'

// https://vitejs.dev/config/
export default defineConfig({
  build: {
    rollupOptions: {
      output: {
        // entryFileNames: 'stylish-reader-phrase-floating-panel.js',
        // chunkFileNames: 'stylish-reader-phrase-floating-panel-[name].js',
        assetFileNames: 'stylish-reader-phrase-floating-panel-[name].[ext]',
        inlineDynamicImports: true,
        entryFileNames: 'stylish-reader-phrase-floating-panel.js'
      }
    }
  },
  plugins: [vue(), vueJsx(), vueDevTools()],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url))
    }
  }
})
