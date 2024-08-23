export default {
  verbose: false,
  build: {
    overwriteDest: true,
  },
  ignoreFiles: [
    "webPage",
    "browserAction",
    "**/*/tsconfig.json",
    "pages",
    "plugins",
    "popup",
    "Notice.md",
    "package.json",
    "pnpm-lock.yaml",
    "pnpm-workspace.yaml",
    "urlExample.md",
    "web-ext-config.mjs",
  ],
};
