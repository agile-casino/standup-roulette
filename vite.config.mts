import { defineConfig } from "vite";
import { analyzer } from "vite-bundle-analyzer";
import bannerPlugin from "vite-plugin-banner";
import checker from "vite-plugin-checker";
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
// @match        https://dev.azure.com/Weatherford-ADOS-WirelineRnD/WirelineRnD*
// @match        https://dev.azure.com/WFRD-RDE-DWC-Software/ProdEng/*
// @icon         https://cdn.vsassets.io/content/icons/favicon.ico
// @grant        GM_xmlhttpRequest
// ==/UserScript==
`.trim();

function getBiomeConfig(platform: string, mode: string): { command: "check" | "ci"; flags: "src" } | false {
  if (platform === "android") {
    return false;
  }
  return mode === "development" ? { command: "check", flags: "src" } : { command: "ci", flags: "src" };
}

export default defineConfig(({ mode }: { mode: string }) => ({
  plugins: [
    analyzer({ analyzerMode: "static" }),
    bannerPlugin({ content: banner, verify: false }),
    checker({
      biome: getBiomeConfig(process.platform, mode),
      typescript: true
    }),
    cssInjectedByJsPlugin()
  ],
  build: {
    manifest: true,
    target: "chrome121",
    chunkSizeWarningLimit: 1024,
    minify: mode !== "development",
    rollupOptions: {
      input: "src/index.tsx",
      output: {
        entryFileNames: "index.user.js",
        manualChunks: undefined
      },
      onwarn(warning, warn) {
        if (warning.code === "MODULE_LEVEL_DIRECTIVE" && warning.message.includes("use client")) {
          return;
        }
        warn(warning);
      }
    }
  }
}));
