# Plan: Package Standup Roulette as a Browser Extension (Manifest V3)

This document outlines the design decisions, sequential steps, and implementation guidelines for packaging the Standup Roulette application as a Manifest V3 browser extension (for Google Chrome, Microsoft Edge, and Mozilla Firefox).

---

## 1. Background & Objectives

Currently, Standup Roulette is built as a **Tampermonkey userscript** (see [vite.config.mts](file:///root/standup-roulette/vite.config.mts)). It interacts directly with the Azure DevOps (ADOS) Board DOM to:
- Inject its launcher button next to the search header (in [index.tsx](file:///root/standup-roulette/src/index.tsx)).
- Automatically filter the sprint board by team and selected user (in [adosHelper.ts](file:///root/standup-roulette/src/utils/adosHelper.ts)).

### The Challenge with Native Azure DevOps Extensions:
Native extensions published to the Visual Studio Marketplace run inside an `iframe` hosted on a sandboxed domain (`*.gallerycdn.vsassets.io`). Under browser Same-Origin Policy, sandboxed iframes are blocked from inspecting or manipulating the parent board's DOM, meaning:
1. We cannot query board DOM elements to scrape team member names.
2. We cannot click on native dropdown buttons (`.directory-selector-dropdown` or `.bolt-list-row`) to programmatically filter the sprint board.
3. The official Azure DevOps Extension SDK does *not* expose any APIs to control or override the board's filter/search panel state.

### Goal of this Plan:
Leverage the browser extension architecture (Manifest V3) to publish Standup Roulette on the **Chrome Web Store** and **Microsoft Edge Add-ons** catalog. This allows us to:
1. Keep the exact DOM manipulation capabilities in [adosHelper.ts](file:///root/standup-roulette/src/utils/adosHelper.ts) fully functional.
2. Support dual-distribution: a single codebase builds both the **userscript** and the **browser extension**.
3. Simplify installation for enterprise users who prefer installing official browser extensions over installing Tampermonkey.

---

## 2. Key Architecture Decisions

1. **Single-Bundle Reuse**: Keep using the `vite-plugin-css-injected-by-js` build setup. Since it generates a single JavaScript bundle containing all JS logic and injected CSS (`dist/index.user.js`), it can be directly used as the extension's content script without needing complex bundler configuration or handling separate stylesheet injections.
2. **Vite `public` Directory Integration**: Use Vite's default behavior where files in a `public/` directory are copied as-is to the build destination (`dist/`). We will store `manifest.json` and extension icons inside `public/`.
3. **No Code Changes to Core Logic**: The extension will inject `index.user.js` directly as a content script. Since `index.tsx` already contains DOM checking and waits for page load/URL changes, it will boot seamlessly inside the browser extension runtime.
4. **Icons Generation**: Generate consistent, high-resolution icons (16x16, 48x48, 128x128) matching the Standup Roulette aesthetic and place them in the extension bundle.

---

## 3. Step-by-Step Implementation Guide

### Step 3.1: Create the `public/` Directory
Vite looks for a `public` directory at the project root to copy static assets.
* Create `/root/standup-roulette/public`

### Step 3.2: Create the `manifest.json` File
Create `public/manifest.json` with Manifest V3 parameters:
```json
{
  "manifest_version": 3,
  "name": "Standup Roulette",
  "version": "4.15.1",
  "description": "Automate standup roulette selection on Azure DevOps sprint boards.",
  "icons": {
    "16": "icon16.png",
    "48": "icon48.png",
    "128": "icon128.png"
  },
  "content_scripts": [
    {
      "matches": [
        "https://dev.azure.com/*"
      ],
      "js": ["index.user.js"],
      "run_at": "document_idle"
    }
  ]
}
```

### Step 3.3: Generate Extension Icons
We need three icon files inside the `public/` folder:
- `icon16.png` (for browser tab/extension menu)
- `icon48.png` (for the extension management page)
- `icon128.png` (for the Web Store installation listing)

*We will generate a modern, sleek logo using the AI image generator tool and downscale/save it as these three assets.*

### Step 3.4: Build Script and Bundling Automation
To automate version synchronization and packaging:
1. **Version Sync Script:** Add a script to copy the package version to the built manifest so you only manage the version in one place (`package.json`). Create `scripts/sync-manifest.js`:
   ```javascript
   const fs = require("fs");
   const pkg = require("../package.json");
   const manifestPath = "./dist/manifest.json";

   if (fs.existsSync(manifestPath)) {
     const manifest = JSON.parse(fs.readFileSync(manifestPath, "utf8"));
     manifest.version = pkg.version;
     fs.writeFileSync(manifestPath, JSON.stringify(manifest, null, 2), "utf8");
     console.log(`Synced manifest.json version to ${pkg.version}`);
   }
   ```
2. **Build and Zip Automation:** Update the scripts in [package.json](file:///root/standup-roulette/package.json):
   ```json
   "scripts": {
     "build": "vite build && node scripts/sync-manifest.js",
     "zip": "zip -r standup-roulette-extension.zip dist/"
   }
   ```

---

## 4. Verification & Testing Workflow

### Local Development Loop
When making changes to the source code:
1. Run the build:
   ```bash
   pnpm build
   ```
2. Open Chrome or Edge and go to `chrome://extensions` or `edge://extensions`.
3. Enable **Developer mode** (toggle in the top-right).
4. Click **Load unpacked** (top-left) and select the `/root/standup-roulette/dist` folder.
5. Whenever you edit the code, run `pnpm build`, click the **Reload icon** on the extension's card in the settings page, and refresh your Azure DevOps board tab.

### Direct Team Sharing (Offline Alternative)
If you want your team to use the extension without waiting for Web Store approval:
1. Run `pnpm build` and `pnpm zip` to produce `standup-roulette-extension.zip`.
2. Distribute this zip file to your team members.
3. Teammates can extract the zip file, open `chrome://extensions`, enable Developer mode, and click **Load unpacked** to load the extracted folder.
4. *Enterprise note:* For corporate environments, IT administrators can use Active Directory Group Policies or Google Workspace admin consoles to force-install the unpacked extension silently on all company machines.

---

## 5. Web Store Submission & Publishing Details

When you are ready to publish public updates:

### Google Chrome Web Store
* **Developer Registration:** Requires a one-time fee of **$5 USD** to register a Chrome Developer account.
* **Review Time:** Typically **1 to 3 business days**. Because the extension requests very narrow host permissions (`https://dev.azure.com/*`) and executes zero external code (no remote CDN scripts), it qualifies for fast-tracked automated reviews.
* **Steps:**
  1. Zip the `dist/` directory.
  2. Go to the [Chrome Developer Dashboard](https://chrome.google.com/webstore/devconsole) and upload the zip.
  3. Enter basic store metadata, screenshots, and submit for review.

### Microsoft Edge Add-ons
* **Developer Registration:** **Free** to register a developer profile.
* **Review Time:** Typically **1 to 5 business days**.
* **Steps:** Submit the exact same `.zip` package compiled for Google Chrome directly to the [Microsoft Partner Center](https://partner.microsoft.com/en-us/dashboard/microsoftedge).

---

## 6. How Updates Flow to Users
Once published, rolling out updates is automated:
1. Bump the version in `package.json` and build.
2. Upload the new `.zip` package to the developer consoles.
3. Once approved, the browsers will automatically fetch, download, and update the extension for your users in the background. No manual steps are required from your users.

