import { defineConfig } from "vite";

export default defineConfig({
  base: "./",
  build: {
    rollupOptions: {
      output: {
        entryFileNames: "login.js",
        assetFileNames: "login-[name].[ext]",
      },
    },
  },
});
