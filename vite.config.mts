import { defineConfig, lazyPlugins } from "vite-plus";
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
  fmt: {
    printWidth: 250,
    arrowParens: "avoid",
    trailingComma: "none",
    quoteProps: "preserve",
    singleQuote: false,
    semi: true,
    sortImports: false,
    sortPackageJson: false,
    ignorePatterns: [".vscode/**", "tsconfig.json"]
  },
  lint: {
    plugins: ["typescript", "unicorn", "oxc", "react", "vitest"],
    jsPlugins: [{ name: "vite-plus", specifier: "vite-plus/oxlint-plugin" }],
    rules: { "vite-plus/prefer-vite-plus-imports": "error" }
  },
  staged: {
    "*.{js,ts,jsx,tsx,json,css}": "vp check --fix",
    "*.{md,yml,yaml}": "vp fmt"
  },
  plugins: lazyPlugins(() => [mode === "development" ? analyzer({ analyzerMode: "static" }) : null, bannerPlugin({ content: banner, verify: false }), cssInjectedByJsPlugin()]),
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
