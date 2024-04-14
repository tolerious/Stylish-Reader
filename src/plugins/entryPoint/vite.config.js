/** @type {import('vite').UserConfig} */
export default {
  // ...
  build: {
    rollupOptions: {
      input: {
        content_script: "content.js",
        background_script: "background.js",
      },
      output: {
        entryFileNames: "[name].js", // 入口文件名
        chunkFileNames: "[name]-chunk.js", // 代码拆分的文件名
        assetFileNames: "[name]-asset.[ext]", // 静态资源文件名
      },
    },
  },
};
