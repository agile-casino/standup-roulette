# Git Hooks Implementation Plan: standup-roulette

This document outlines the steps to introduce Git hooks in **standup-roulette** to enforce testing, compiling, and formatting guidelines.

---

## 1. Objectives

To align with the project guidelines established in [merge-mentor](file:///root/merge-mentor) and [ados-helper](file:///root/ados-helper), we will integrate a pre-push script check using Husky.

---

## 2. Configuration Setup

Currently, [package.json](file:///root/standup-roulette/package.json) contains discrete linting and testing scripts but lacks a unified pipeline check script. 

We will define a new `"check"` script to run:
* **`pnpm build`**: Verifies compilation and typescript compiler integrity.
* **`pnpm test`**: Executes unit tests via Vitest.
* **`pnpm lint`**: Enforces code style constraints (Biome, Prettier, Knip).

---

## 3. Step-by-Step Implementation Guide

### Step 3.1: Define Unified Check Script
Modify the `scripts` object in [package.json](file:///root/standup-roulette/package.json#L6-L20) to add the `"check"` command:
```json
"scripts": {
  ...
  "check": "pnpm build && pnpm test && pnpm lint",
  ...
}
```

### Step 3.2: Install Husky Dependency
Add `husky` as a devDependency:
```bash
pnpm add -D husky
```

### Step 3.3: Configure Automatic Setup
Add a `prepare` hook script inside [package.json](file:///root/standup-roulette/package.json#L6-L20):
```json
"scripts": {
  ...
  "prepare": "husky"
}
```

Then initialize Husky:
```bash
pnpm prepare
```

### Step 3.4: Configure the Hook script
Create the hook configuration at `.husky/pre-push` with the following validation trigger:
```bash
#!/usr/bin/env sh
. "$(dirname -- "$0")/_/husky.sh"

pnpm check
```

Ensure the file is executable:
```bash
chmod +x .husky/pre-push
```

---

## 4. Verification

1. **Verify Scripts:** Execute `pnpm check` locally to ensure all compiling, testing, and formatting validation steps run.
2. **Push Interception:** Test push interception by adding a temp check failure (e.g. syntax error or test failure), verifying git push fails before remote submission.
