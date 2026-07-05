import { defineConfig } from "vite";
import { analyzer } from "vite-bundle-analyzer";
import bannerPlugin from "vite-plugin-banner";
import cssInjectedByJsPlugin from "vite-plugin-css-injected-by-js";
import pkg from "./package.json";

const banner = `
// ==UserScript==
// @name         Standup Roulette
// @namespace    https://ados/
// @version      ${pkg.version}
// @downloadURL  https://github.com/agile-casino/standup-roulette/releases/latest/download/standup-roulette.user.js
// @updateURL    https://github.com/agile-casino/standup-roulette/releases/latest/download/standup-roulette.user.js
// @description  Standup Roulette
// @author       archerax
// @match        https://dev.azure.com/*
// @icon         https://cdn.vsassets.io/content/icons/favicon.ico
// @grant        GM_xmlhttpRequest
// ==/UserScript==
`.trim();

export default defineConfig(({ mode }: { mode: string }) => ({
  plugins: [mode === "development" ? analyzer({ analyzerMode: "static" }) : null, bannerPlugin({ content: banner, verify: false }), cssInjectedByJsPlugin()],
  build: {
    manifest: false,
    target: "chrome121",
    chunkSizeWarningLimit: 1024,
    minify: mode !== "development",
    rollupOptions: {
      input: "src/index.tsx",
      output: {
        entryFileNames: "standup-roulette.user.js",
        manualChunks: undefined
      },
      onwarn(warning, warn) {
        if (warning.code === "MODULE_LEVEL_DIRECTIVE" && warning.message?.includes("use client")) {
          return;
        }
        warn(warning);
      }
    }
  }
}));
