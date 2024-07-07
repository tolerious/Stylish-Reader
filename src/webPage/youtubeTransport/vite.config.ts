import { fileURLToPath, URL } from 'node:url'

import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import vueJsx from '@vitejs/plugin-vue-jsx'
import vueDevTools from 'vite-plugin-vue-devtools'

// https://vitejs.dev/config/
export default defineConfig({
  define: {
    'process.env': {}
  },
  build: {
    lib: { name: 'youtube-transport', entry: './src/main.ts' },
    rollupOptions: {
      output: {
        globals: { vue: 'Vue' },
        entryFileNames: 'youtube-transport.js', // 入口文件名
        chunkFileNames: 'youtube-transport-[name].js', // 代码拆分的文件名
        assetFileNames: 'youtube-transport-[name].[ext]' // 静态资源文件名
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
