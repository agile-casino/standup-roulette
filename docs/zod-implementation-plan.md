# Zod Implementation Plan: standup-roulette

This document outlines the sequential steps and design guidelines for introducing runtime schema validation using the `zod` library in **standup-roulette**.

---

## 1. Background & Objectives

Currently, **standup-roulette** stores its game lists, speaker configurations, and timer settings in browser `localStorage` (via Zustand's `persist` middleware) and allows users to export/import their state as JSON files.

### The Risks:
* **Corrupt JSON Imports:** In [ImportExportSettings.tsx](file:///root/standup-roulette/src/components/ImportExportSettings.tsx#L55-L62), imported files are parsed directly with `JSON.parse` and sent to the store. A malformed or corrupted file can immediately break UI rendering.
* **Complex, Manual Normalization:** The store contains a large, custom parsing block (`normalizeImportedState` and `normalizeEndImageUrls` in [useRouletteStore.ts](file:///root/standup-roulette/src/store/useRouletteStore.ts#L77-L132)) to manually verify, clean, and map properties. This is difficult to maintain and expand.
* **Mascot API Changes:** The app queries mascot resources asynchronously. If the response structure shifts, the UI could fail when rendering winner screens.

### Goals of Zod Integration:
1. **Declarative Validation:** Replace imperative property-checking code with structured Zod schemas.
2. **Import Integrity:** Validate imported configuration files before applying them to the reactive store.
3. **Robust Storage Loading:** Ensure that data loaded by Zustand's `persist` middleware conforms to current schemas.

---

## 2. Key Target Areas & Schema Designs

We will define our validation schemas in a new file: `src/store/roulette/state/schemas.ts`.

### Schema 2.1: End Image Urls Schema
Validates the custom winner animations and image configurations.
```typescript
import { z } from "zod";

export const EndImageUrlSchema = z.object({
  url: z.string().url().or(z.string().trim().min(1)),
  enabled: z.boolean().default(true),
});
```

### Schema 2.2: Roulette User Schema
Validates individual team members participating in the roulette wheel.
```typescript
export const RouletteUserSchema = z.object({
  id: z.string().uuid().or(z.string().trim().min(1)),
  name: z.string().trim().min(1),
  team: z.string().trim().default(""),
  checked: z.boolean().default(true),
  colour: z.string().optional(),
});
```

### Schema 2.3: Game State Schema
Validates individual game profiles (which hold specific groups of users).
```typescript
export const GameStateSchema = z.object({
  name: z.string().trim().min(1).default("Game"),
  allUsers: z.array(RouletteUserSchema).default([]),
  remainingUsers: z.array(RouletteUserSchema).default([]),
  spinning: z.boolean().default(false),
  winningId: z.string().nullable().default(null),
  winningName: z.string().nullable().default(null),
  seed: z.number().default(0),
  endImageUrls: z.array(EndImageUrlSchema).default([]),
});
```

### Schema 2.4: Core Store State Schema
The overarching schema validating the entire Zustand store configuration.
```typescript
export const RouletteStateSchema = z.object({
  currentGame: z.number().int().nonnegative().default(0),
  games: z.array(GameStateSchema).min(1),
  timerType: z.enum(["off", "up", "down"]).default("off"),
  timerDuration: z.number().int().positive().default(60),
  timerLimit: z.number().int().positive().default(60),
});

export type RouletteState = z.infer<typeof RouletteStateSchema>;
```

---

## 3. Step-by-Step Implementation Guide

### Step 3.1: Add Dependencies
Install `zod` in [package.json](file:///root/standup-roulette/package.json):
```bash
pnpm add zod
```

### Step 3.2: Create Schema Declarations
Create `src/store/roulette/state/schemas.ts` and write the schema definitions outlined in Section 2.

### Step 3.3: Refactor the Zustand Store Parser
In [useRouletteStore.ts](file:///root/standup-roulette/src/store/useRouletteStore.ts):
1. Import `RouletteStateSchema`.
2. Replace `normalizeImportedState` with a Zod check:
   ```typescript
   function normalizeImportedState(state: unknown): RouletteState {
     const result = RouletteStateSchema.safeParse(state);
     if (result.success) {
       return result.data;
     }
     
     // Log schema errors and return standard initial state
     console.error("Zod Schema Mismatch:", result.error.format());
     return {
       currentGame: 0,
       games: [initialGameState("Game 1")],
       timerType: "off",
       timerDuration: 60,
       timerLimit: 60
     };
   }
   ```
3. Remove redundant validator helper functions (e.g., `normalizeEndImageUrls`).

### Step 3.4: Integrate validation into Settings Import
In [ImportExportSettings.tsx](file:///root/standup-roulette/src/components/ImportExportSettings.tsx#L55-L62):
* Before calling `importState(importedState)`, run `RouletteStateSchema.safeParse(importedState)`.
* If validation fails, alert the user with a descriptive error message indicating the file format is invalid instead of loading broken data.

---

## 4. Testing & Verification

1. **Store Unit Tests:**
   * Modify [useRouletteStore.spec.ts](file:///root/standup-roulette/src/store/useRouletteStore.spec.ts) to feed malformed objects to the store imports and check that the store handles validation errors gracefully.
2. **Manual verification:**
   * Launch the dev sandbox (`pnpm dev`).
   * Export the game settings, alter some parameters in the JSON to be type-invalid, attempt to re-import, and verify that the app blocks the import cleanly.
