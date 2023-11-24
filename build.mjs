import * as esbuild from "esbuild";
import { createRequire } from "module";

const require = createRequire(import.meta.url);
const pkg = require("./package.json");

const banner = `
// ==UserScript==
// @name         Standup Roulette
// @namespace    https://ados/
// @version      ${pkg.version}
// @downloadURL  https://archerax.blob.core.windows.net/apps>
// @description  Standup Roulette
// @author       archerax
// @match        https://ados/WirelineRnD_Collection/Wirelin>
// @icon         https://ados/favicon.ico
// @grant        none
// ==/UserScript==
`;

const result = await esbuild.build({
  entryPoints: ["./src/index.tsx"],
  bundle: true,
  minify: true,
  treeShaking: true,
  sourcemap: true,
  target: ["chrome118"],
  outfile: "./dist/index.user.js",
  banner: { js: banner }
});
