import vue from "@vitejs/plugin-vue";
import { defineConfig } from "vite";

// https://vitejs.dev/config/
export default defineConfig({
  build: {
    rollupOptions: {
      output: {
        entryFileNames: "stylish-reader-video-page.js", // 入口文件名
        chunkFileNames: "stylish-reader-video-page-chunk-[name].js", // 代码拆分的文件名
        assetFileNames: "stylish-reader-video-page-[name].[ext]", // 静态资源文件名
      },
    },
  },
  plugins: [vue()],
});
