/** @type {import('vite').UserConfig} */
export default {
  // ...
  build: {
    rollupOptions: {
      output: {
        entryFileNames: "content_script.js", // 入口文件名
        chunkFileNames: "content-script-chunk-[name].js", // 代码拆分的文件名
        assetFileNames: "content-script-[name].[ext]", // 静态资源文件名
      },
    },
  },
};
