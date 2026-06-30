# Release Procedure

This document outlines the steps to release a new version of **Standup Roulette**.

## 1. Prerequisites

Ensure you have the correct Node.js environment and dependencies installed:

```bash
# Install corepack if not installed
npm i -g corepack@latest
corepack enable

# Install project dependencies
pnpm install
```

---

## 2. Release Steps

### Step 2.1: Determine the New Version

Decide on the next version number following Semantic Versioning (SemVer):

- **Patch release** (e.g., `4.16.0` -> `4.16.1`): For bug fixes and minor internal adjustments.
- **Minor release** (e.g., `4.16.0` -> `4.17.0`): For new backwards-compatible features.
- **Major release** (e.g., `4.16.0` -> `5.0.0`): For breaking changes.

### Step 2.2: Update Version Strings

Update the version string in the following files:

1. **[package.json](file:///root/standup-roulette/package.json)** (line 3):
   ```json
   "version": "4.16.1"
   ```
2. **[public/manifest.json](file:///root/standup-roulette/public/manifest.json)** (line 4):
   ```json
   "version": "4.16.1"
   ```

### Step 2.3: Verify Locally

Always run local checks to ensure the build succeeds, tests pass, and code complies with formatting rules:

```bash
# Build the project (generates the userscript bundle in dist/)
pnpm run build

# Sync the manifest version to dist/manifest.json
pnpm run sync

# Package the extension into a zip file
pnpm run zip

# Run the test suite
pnpm run test

# Run the linter/formatter check
pnpm biome ci src
```

### Step 2.4: Commit the Release Changes

Stage the version updates and create a commit:

```bash
git add package.json public/manifest.json
git commit -m "chore: release vX.Y.Z"
```

_(Replace `vX.Y.Z` with the actual version number, e.g., `v4.16.1`)_

### Step 2.5: Tag the Commit

Create a local git tag matching the version:

```bash
git tag vX.Y.Z
```

### Step 2.6: Push to GitHub

Push the branch and the new tag to trigger the release workflow:

```bash
git push origin main
git push origin vX.Y.Z
```

---

## 3. Automated Release Workflow

Once the tag is pushed to GitHub, the **Release Workflow** ([.github/workflows/release.yml](file:///root/standup-roulette/.github/workflows/release.yml)) is triggered automatically.

This workflow:

1. Checks out the code.
2. Installs dependencies and runs the build (`pnpm run build`), version sync (`pnpm run sync`), packaging (`pnpm run zip`), and tests (`pnpm run test` & `pnpm biome ci src`).
3. Deploys the built userscript (`dist/index.user.js`) to **Azure Blob Storage** under the container `apps/standup-roulette/`.
4. Creates a new **GitHub Release** corresponding to the tag, attaching:
   - `dist/index.user.js` (userscript)
   - `standup-roulette-extension-vX.Y.Z.zip` (packaged browser extension)
