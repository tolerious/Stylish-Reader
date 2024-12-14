import { fileURLToPath, URL } from 'node:url'

import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import vueJsx from '@vitejs/plugin-vue-jsx'
import vueDevTools from 'vite-plugin-vue-devtools'
import cssInjectedByJsPlugin from 'vite-plugin-css-injected-by-js'

// https://vite.dev/config/
export default defineConfig({
  base: './',
  build: {
    rollupOptions: {
      output: {
        entryFileNames: 'stylish-reader-popup.js', // 入口文件名
        chunkFileNames: 'stylish-reader-popup-[name].js', // 代码拆分的文件名
        assetFileNames: 'stylish-reader-popup-[name].[ext]', // 静态资源文件名
      },
    },
  },
  plugins: [vue(), vueJsx(), vueDevTools(), cssInjectedByJsPlugin()],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
})
