/** @type {import('vite').UserConfig} */
export default {
  // ...
  build: {
    outDir: "content",
    rollupOptions: {
      input: {
        content_script: "content.js",
        // background_script: "background.js",
      },
      output: {
        format: "iife", // 指定输出格式为IIFE
        inlineDynamicImports: false, // 确保多输入文件不使用 inlineDynamicImports
        entryFileNames: "[name].js", // 入口文件名
        chunkFileNames: "[name]-chunk.js", // 代码拆分的文件名
        assetFileNames: "[name]-asset.[ext]", // 静态资源文件名
      },
    },
  },
};
