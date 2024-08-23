import { defineConfig } from "vite";

export default defineConfig({
  base: "./",
  build: {
    outDir: "loginPage",
    rollupOptions: {
      output: {
        entryFileNames: "login.js",
        assetFileNames: "login-[name].[ext]",
      },
    },
  },
});
