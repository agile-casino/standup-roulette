# Migration Plan: Redux Toolkit to Zustand

This document outlines the design decisions, sequential steps, and implementation guidelines for migrating the state management of the Standup Roulette application from Redux Toolkit (with a custom persistence/migration utility) to Zustand.

---

## 1. Background & Objectives

Currently, the application uses **Redux Toolkit** along with a custom-built persistence layer ([persist.ts](file:///root/standup-roulette/src/store/persist.ts)) wrapping the slice reducer. This custom utility has several notable drawbacks:

- **Synchronous disk writes on every action**: Blocks the main thread on every single action dispatch, creating UI jank.
- **Incomplete migrations**: Lacks sequential migration chaining, leaving older states half-migrated and prone to schema-mismatch runtime errors.
- **No error handling**: Direct `localStorage` writes can throw exceptions (e.g., in private browsing or when storage quota is exceeded) which crash the Redux reducers.

### Goals of the Migration:

1. **Seamless User Transition**: Ensure no user loses their settings or game configuration when upgrading.
2. **Sequential Migration Chaining**: Upgrade settings stored as `v2`, `v3`, or `v4` step-by-step to the current schema `v6`.
3. **Improved Performance**: Leverage Zustand's non-blocking, clean reactive state updates.
4. **Bundle Optimization**: Clean up and remove heavy dependencies (`@reduxjs/toolkit` and `react-redux`) from the final compiled userscript bundle.

---

## 2. Key Architecture Decisions (Aligning on Plan)

Through interactive alignment, we have decided on the following design choices:

1. **Full Migration**: Completely replace Redux Toolkit and React Redux with Zustand rather than just rewriting the persistence middleware.
2. **Idiomatic Store Actions**: Define state-modifying actions directly inside the Zustand store as methods (e.g., `state.addUser(...)`) instead of utilizing a Redux-like action-dispatch mechanism.
3. **Immer Middleware Integration**: Use Zustand's `immer` middleware to allow mutation-style updates, keeping complex state updates (e.g., modifying deeply nested structures in games) clean and readable.
4. **Preserved Compatibility (v2+)**: Since all active users are on `v2` or higher, standard JSON storage is used without custom wrapper adapters. The migration handler will focus entirely on sequential steps from `v2`, `v3`, and `v4` up to `v6`.
5. **Unit Test Updates**: Adapt and rewrite existing tests to fully cover the new store, actions, and migration pipelines.

---

## 3. Detailed Step-by-Step Guide

### Step 3.1: Verify Installed Dependencies

Ensure `zustand` and `immer` are installed in [package.json](file:///root/standup-roulette/package.json):

```json
"dependencies": {
  "immer": "^11.1.8",
  "zustand": "^5.0.14"
}
```

### Step 3.2: Implement the Zustand Store

Create the new store file in `src/store/useRouletteStore.ts`. This store will encapsulate all state variables and action functions.

#### Store Schema and Types:

The store state should mirror `RouletteState` (as defined in [RouletteState.ts](file:///root/standup-roulette/src/store/roulette/state/v4/RouletteState.ts)):

- `currentGame`: number
- `games`: Array of game configurations (users, seed, spinning, etc.)
- `timerType`: `"off" | "up" | "down"`
- `timerDuration`: number
- `timerLimit`: number

#### Implementation Blueprint:

```typescript
import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { immer } from "zustand/middleware/immer";
import { v4 as uuidv4 } from "uuid";
import { migrations } from "./roulette/state/migrations";
import { getColourScheme } from "../utils/colourScheme";
import { deepCopy } from "../utils/deepCopy";
import type {
  RouletteState,
  RouletteUser,
  EndImageUrl,
} from "./roulette/state";

interface RouletteActions {
  setGameName: (name: string) => void;
  prevGame: () => void;
  nextGame: () => void;
  addUser: (name: string) => void;
  removeUser: (id: string) => void;
  setUserName: (id: string, name: string) => void;
  setUserTeam: (id: string, team: string) => void;
  toggleUser: (id: string) => void;
  prepareSpin: (random: number) => void;
  beginSpin: () => void;
  endSpin: () => void;
  reset: (seed: number) => void;
  addEndImageUrl: () => void;
  removeEndImageUrl: (index: number) => void;
  setEndImageUrlValue: (index: number, url: string) => void;
  setEndImageUrlEnabled: (index: number, enabled: boolean) => void;
  importState: (imported: unknown) => void;
  setTimerType: (type: "off" | "up" | "down") => void;
  setTimerDuration: (duration: number) => void;
  setTimerLimit: (limit: number) => void;
}

export type RouletteStoreType = RouletteState & RouletteActions;

const initialGameState = (name: string) => ({
  name,
  allUsers: [],
  remainingUsers: [],
  spinning: false,
  winningId: null,
  winningName: null,
  seed: 0,
  endImageUrls: [],
});

function assignColours(users: RouletteUser[]): void {
  const selectedUsers = users.filter((x) => x.checked);
  const colours = getColourScheme(selectedUsers.length);
  for (let i = 0; i < colours.length; i++) {
    selectedUsers[i].colour = colours[i];
  }
}

export const useRouletteStore = create<RouletteStoreType>()(
  persist(
    immer((set, get) => ({
      // --- Initial State ---
      currentGame: 0,
      games: [initialGameState("Game 1")],
      timerType: "off",
      timerDuration: 60,
      timerLimit: 60,

      // --- Actions ---
      setGameName: (name) =>
        set((state) => {
          state.games[state.currentGame].name = name;
        }),

      prevGame: () =>
        set((state) => {
          if (state.games[state.currentGame].spinning) return;
          const index = Math.max(state.currentGame - 1, 0);
          if (!state.games[index]) {
            state.games[index] = initialGameState(`Game ${index + 1}`);
          }
          state.currentGame = index;
        }),

      nextGame: () =>
        set((state) => {
          if (state.games[state.currentGame].spinning) return;
          const index = Math.min(state.currentGame + 1, 4);
          if (!state.games[index]) {
            state.games[index] = initialGameState(`Game ${index + 1}`);
          }
          state.currentGame = index;
        }),

      addUser: (name) =>
        set((state) => {
          const game = state.games[state.currentGame];
          game.allUsers.push({ id: uuidv4(), name, checked: true });
          game.allUsers.sort((a, b) => a.name.localeCompare(b.name));
          assignColours(game.allUsers);
        }),

      removeUser: (id) =>
        set((state) => {
          const game = state.games[state.currentGame];
          game.allUsers = game.allUsers.filter((u) => u.id !== id);
          assignColours(game.allUsers);
        }),

      setUserName: (id, newUserName) =>
        set((state) => {
          const game = state.games[state.currentGame];
          const user = game.allUsers.find((u) => u.id === id);
          if (user) {
            user.name = newUserName;
            game.allUsers.sort((a, b) => a.name.localeCompare(b.name));
            assignColours(game.allUsers);
          }
        }),

      setUserTeam: (id, newTeamName) =>
        set((state) => {
          const game = state.games[state.currentGame];
          const user = game.allUsers.find((u) => u.id === id);
          if (user) {
            user.team = newTeamName;
          }
        }),

      toggleUser: (id) =>
        set((state) => {
          const game = state.games[state.currentGame];
          const user = game.allUsers.find((u) => u.id === id);
          if (user) {
            user.checked = !user.checked;
            assignColours(game.allUsers);
          }
        }),

      prepareSpin: (random) =>
        set((state) => {
          const game = state.games[state.currentGame];
          if (game.winningId !== null) {
            game.remainingUsers = game.remainingUsers.filter(
              (u) => u.id !== game.winningId,
            );
          }
          if (game.remainingUsers.length > 0) {
            const length = game.remainingUsers.length;
            const winningIndex = Math.min(
              Math.floor(random * length),
              length - 1,
            );
            game.winningId = game.remainingUsers[winningIndex].id;
          }
        }),

      beginSpin: () =>
        set((state) => {
          const game = state.games[state.currentGame];
          if (game.remainingUsers.length > 0) {
            game.spinning = true;
          }
        }),

      endSpin: () =>
        set((state) => {
          const game = state.games[state.currentGame];
          if (game.winningId !== null) {
            const user = game.remainingUsers.find(
              (u) => u.id === game.winningId,
            );
            if (user) {
              game.winningName = user.name;
            }
          }
          game.spinning = false;
        }),

      reset: (seed) =>
        set((state) => {
          const game = state.games[state.currentGame];
          game.remainingUsers = deepCopy(
            game.allUsers.filter((x) => x.checked),
          );
          game.winningId = null;
          game.winningName = null;
          game.seed = seed;
        }),

      addEndImageUrl: () =>
        set((state) => {
          state.games[state.currentGame].endImageUrls.push({
            url: "",
            enabled: true,
          });
        }),

      removeEndImageUrl: (index) =>
        set((state) => {
          const game = state.games[state.currentGame];
          game.endImageUrls = game.endImageUrls.filter(
            (_, idx) => idx !== index,
          );
        }),

      setEndImageUrlValue: (index, url) =>
        set((state) => {
          const imageUrl = state.games[state.currentGame].endImageUrls[index];
          if (imageUrl) {
            imageUrl.url = url;
          }
        }),

      setEndImageUrlEnabled: (index, enabled) =>
        set((state) => {
          const imageUrl = state.games[state.currentGame].endImageUrls[index];
          if (imageUrl) {
            imageUrl.enabled = enabled;
          }
        }),

      importState: (imported) =>
        set((state) => {
          // You can call your legacy normalizer here
          const normalized = normalizeImportedState(imported);
          state.currentGame = normalized.currentGame;
          state.games = normalized.games;
          state.timerType = normalized.timerType;
          state.timerDuration = normalized.timerDuration;
          state.timerLimit = normalized.timerLimit;
        }),

      setTimerType: (type) =>
        set((state) => {
          state.timerType = type;
        }),

      setTimerDuration: (duration) =>
        set((state) => {
          state.timerDuration = duration;
        }),

      setTimerLimit: (limit) =>
        set((state) => {
          state.timerLimit = limit;
        }),
    })),
    {
      name: "roulette", // Matches legacy localStorage key
      version: 6, // Matches legacy schema version
      storage: createJSONStorage(() => localStorage),
      migrate: (persistedState: any, version: number) => {
        let state = persistedState;

        // Step 1: Migrate v2 -> v4
        if (version === 2) {
          state = migrations[2](state);
          version = 4;
        }

        // Step 2: Migrate v3 -> v4
        if (version === 3) {
          state = migrations[3](state);
          version = 4;
        }

        // Step 3: Migrate v4 -> v6
        if (version === 4) {
          state = migrations[4](state);
          version = 6;
        }

        return state;
      },
    },
  ),
);
```

---

### Step 3.3: Refactor React Components

All component files that previously integrated with Redux selectors and actions will switch to the hook-based Zustand store.

#### Header Refactor Example ([Header.tsx](file:///root/standup-roulette/src/components/Header.tsx)):

- **Before (Redux)**:

  ```typescript
  import { useAppDispatch, useAppSelector } from "../store/hooks";
  import { setGameName, prevGame, nextGame, selectGameName, selectSpinning, ... } from "../store/roulette/rouletteSlice";

  const gameName = useAppSelector(selectGameName);
  const dispatch = useAppDispatch();
  // dispatch(prevGame());
  ```

- **After (Zustand)**:

  ```typescript
  import { useRouletteStore } from "../store/useRouletteStore";

  const gameName = useRouletteStore(
    (state) => state.games[state.currentGame].name,
  );
  const spinning = useRouletteStore(
    (state) => state.games[state.currentGame].spinning,
  );
  const prevGame = useRouletteStore((state) => state.prevGame);
  const nextGame = useRouletteStore((state) => state.nextGame);
  // prevGame();
  ```

#### Settings Panel Refactor Example ([SettingsPanel.tsx](file:///root/standup-roulette/src/components/SettingsPanel.tsx)):

- **Before (Redux)**:
  ```typescript
  import { useAppDispatch, useAppSelector } from "../store/hooks";
  import {
    addEndImageUrl,
    removeEndImageUrl,
    setEndImageUrlValue,
    setEndImageUrlEnabled,
  } from "../store/roulette/rouletteSlice";
  ```
- **After (Zustand)**:

  ```typescript
  import { useRouletteStore } from "../store/useRouletteStore";

  const endImageUrls = useRouletteStore(
    (state) => state.games[state.currentGame].endImageUrls,
  );
  const addEndImageUrl = useRouletteStore((state) => state.addEndImageUrl);
  const removeEndImageUrl = useRouletteStore(
    (state) => state.removeEndImageUrl,
  );
  const setEndImageUrlValue = useRouletteStore(
    (state) => state.setEndImageUrlValue,
  );
  const setEndImageUrlEnabled = useRouletteStore(
    (state) => state.setEndImageUrlEnabled,
  );
  ```

---

### Step 3.4: Adapt and Rewrite Unit Tests

Existing unit tests for persistence, migrations, and reducer states should be adapted for the new Zustand store structure.

#### Migrations Unit Test ([migrations.spec.ts](file:///root/standup-roulette/src/store/roulette/state/migrations.spec.ts)):

Verify that Zustand's `migrate` config function behaves correctly given previous versions of simulated states.

```typescript
import { migrations } from "./migrations";

describe("Zustand Migrations", () => {
  it("should sequentially migrate state from v2 to v6", () => {
    const mockV2State = { ... };
    // Simulate migration pipeline
    let state = migrations[2](mockV2State); // v2 -> v4
    state = migrations[4](state);           // v4 -> v6

    expect(state.timerLimit).toEqual(60);
    expect(state.games[0].name).toEqual("Game 1");
  });
});
```

#### Slice/Store Unit Test ([rouletteSlice.spec.ts](file:///root/standup-roulette/src/store/roulette/rouletteSlice.spec.ts)):

Since we no longer compile a Redux reducer, `rouletteSlice.spec.ts` can be rewritten to assert directly on the Zustand store hook actions:

```typescript
import { useRouletteStore } from "../useRouletteStore";

describe("Roulette Store Actions", () => {
  beforeEach(() => {
    useRouletteStore.setState({
      currentGame: 0,
      games: [
        {
          name: "Game 1",
          allUsers: [],
          remainingUsers: [],
          spinning: false,
          winningId: null,
          winningName: null,
          seed: 0,
          endImageUrls: [],
        },
      ],
    });
  });

  it("should add a user", () => {
    useRouletteStore.getState().addUser("Alice");
    const users = useRouletteStore.getState().games[0].allUsers;
    expect(users).toHaveLength(1);
    expect(users[0].name).toEqual("Alice");
  });
});
```

---

### Step 3.5: Clean up Redux Dependencies

Once the app works end-to-end and tests pass:

1. Delete the files:
   - `src/store/persist.ts`
   - `src/store/persist.spec.ts`
   - `src/store/hooks.ts`
   - `src/store/index.ts`
   - `src/store/roulette/rouletteSlice.ts`
   - `src/store/roulette/rouletteSlice.spec.ts` (replaced by Zustand store tests)
2. Remove the `<Provider store={store}>` wrapper from [App.tsx](file:///root/standup-roulette/src/App.tsx#L67-L71).
3. Run the prune command:
   ```bash
   pnpm remove @reduxjs/toolkit react-redux
   ```
4. Verify the build executes successfully using `pnpm build`.
