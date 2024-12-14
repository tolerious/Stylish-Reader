import { fileURLToPath, URL } from "node:url";

import { defineConfig } from "vite";

// https://vitejs.dev/config/
export default defineConfig({
  build: {
    rollupOptions: {
      output: {
        entryFileNames: "translation-panel.js", // 入口文件名
        chunkFileNames: "translation-panel-[name].js", // 代码拆分的文件名
        assetFileNames: "translation-panel-[name].[ext]", // 静态资源文件名
      },
    },
  },
  plugins: [],
  resolve: {
    alias: {
      "@": fileURLToPath(new URL("./src", import.meta.url)),
    },
  },
});
