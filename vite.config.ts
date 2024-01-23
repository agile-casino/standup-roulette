import { defineConfig } from "vite";
import bannerPlugin from "vite-plugin-banner";
import cssInjectedByJsPlugin from "vite-plugin-css-injected-by-js";
import pkg from "./package.json";

const banner = `
// ==UserScript==
// @name         Standup Roulette
// @namespace    https://ados/
// @version      ${pkg.version}
// @downloadURL  https://archerax.blob.core.windows.net/apps/standup-roulette/index.user.js
// @description  Standup Roulette
// @author       archerax
// @match        https://ados/WirelineRnD_Collection/WirelineRnD*
// @icon         https://ados/favicon.ico
// @grant        none
// ==/UserScript==
`.trim();

export default defineConfig({
  plugins: [
    bannerPlugin({ content: banner, verify: false }),
    cssInjectedByJsPlugin()
  ],
  build: {
    manifest: true,
    target: "chrome118",
    chunkSizeWarningLimit: 1024,
    rollupOptions: {
      input: "src/index.tsx",
      output: {
        entryFileNames: "index.user.js",
        manualChunks: undefined
      }
    }
  },
  test: {
    setupFiles: "tests/setup.ts"
  },
});
