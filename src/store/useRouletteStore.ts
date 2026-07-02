import { v4 as uuidv4 } from "uuid";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import { immer } from "zustand/middleware/immer";
import { getColourScheme } from "../utils/colourScheme";
import { deepCopy } from "../utils/deepCopy";
import { orderBy } from "../utils/orderBy";
import type { EndImageUrl, RouletteState, RouletteUser } from "./roulette/state";
import { migrations } from "./roulette/state/migrations";

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
  setWheelType: (type: "old" | "new") => void;
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
  endImageUrls: []
});

function assignColours(users: RouletteUser[]): void {
  const selectedUsers = users.filter(x => x.checked);
  const colours = getColourScheme(selectedUsers.length);
  for (let i = 0; i < colours.length; i++) {
    selectedUsers[i].colour = colours[i];
  }
}

function normalizeEndImageUrls(endImageUrls: unknown, endImageUrl: unknown): EndImageUrl[] {
  const normalized: EndImageUrl[] = [];

  if (Array.isArray(endImageUrls)) {
    for (const endImage of endImageUrls) {
      if (typeof endImage === "object" && endImage !== null && "url" in endImage) {
        const url = endImage.url;
        if (typeof url === "string" && url.trim().length > 0) {
          const enabled = "enabled" in endImage ? endImage.enabled !== false : true;
          normalized.push({ url, enabled });
        }
      }
    }
  }

  if (!normalized.length && typeof endImageUrl === "string" && endImageUrl.trim().length > 0) {
    normalized.push({ url: endImageUrl, enabled: true });
  }

  return normalized;
}

function normalizeImportedState(state: unknown): RouletteState {
  if (typeof state !== "object" || state === null || !Array.isArray((state as RouletteState).games)) {
    return {
      currentGame: 0,
      games: [initialGameState("Game 1")],
      timerType: "off",
      timerDuration: 60,
      timerLimit: 60,
      wheelType: "old"
    };
  }

  const importedState = state as {
    currentGame?: number;
    games: Array<Record<string, unknown>>;
    timerType?: "off" | "up" | "down";
    timerDuration?: number;
    timerLimit?: number;
    wheelType?: "old" | "new";
  };
  const games = importedState.games.map((game, index) => {
    const name = typeof game.name === "string" && game.name.trim().length > 0 ? game.name : `Game ${index + 1}`;
    return {
      name,
      allUsers: Array.isArray(game.allUsers) ? (game.allUsers as RouletteUser[]) : [],
      remainingUsers: Array.isArray(game.remainingUsers) ? (game.remainingUsers as RouletteUser[]) : [],
      spinning: game.spinning === true,
      winningId: typeof game.winningId === "string" ? game.winningId : null,
      winningName: typeof game.winningName === "string" ? game.winningName : null,
      seed: typeof game.seed === "number" ? game.seed : 0,
      endImageUrls: normalizeEndImageUrls(game.endImageUrls, game.endImageUrl)
    };
  });

  if (!games.length) {
    games.push(initialGameState("Game 1"));
  }

  const requestedCurrentGame = typeof importedState.currentGame === "number" ? importedState.currentGame : 0;
  const currentGame = Math.min(Math.max(Math.floor(requestedCurrentGame), 0), games.length - 1);

  let timerType: "off" | "up" | "down" = "off";
  if (importedState.timerType === "off" || importedState.timerType === "up" || importedState.timerType === "down") {
    timerType = importedState.timerType;
  } else {
    timerType = "off";
  }
  const timerDuration = typeof importedState.timerDuration === "number" ? importedState.timerDuration : 60;
  const timerLimit = typeof importedState.timerLimit === "number" ? importedState.timerLimit : 60;

  let wheelType: "old" | "new" = "old";
  if (importedState.wheelType === "old" || importedState.wheelType === "new") {
    wheelType = importedState.wheelType;
  }

  return {
    currentGame,
    games,
    timerType,
    timerDuration,
    timerLimit,
    wheelType
  };
}

export const useRouletteStore = create<RouletteStoreType>()(
  persist(
    immer(set => ({
      // --- Initial State ---
      currentGame: 0,
      games: [initialGameState("Game 1")],
      timerType: "off",
      timerDuration: 60,
      timerLimit: 60,
      wheelType: "old",

      // --- Actions ---
      setGameName: name =>
        set(state => {
          state.games[state.currentGame].name = name;
        }),

      prevGame: () =>
        set(state => {
          if (state.games[state.currentGame].spinning) return;
          const index = Math.max(state.currentGame - 1, 0);
          if (!state.games[index]) {
            state.games[index] = initialGameState(`Game ${index + 1}`);
          }
          state.currentGame = index;
        }),

      nextGame: () =>
        set(state => {
          if (state.games[state.currentGame].spinning) return;
          const index = Math.min(state.currentGame + 1, 4);
          if (!state.games[index]) {
            state.games[index] = initialGameState(`Game ${index + 1}`);
          }
          state.currentGame = index;
        }),

      addUser: name =>
        set(state => {
          const game = state.games[state.currentGame];
          game.allUsers.push({ id: uuidv4(), name, checked: true });
          game.allUsers.sort(orderBy(x => x.name));
          assignColours(game.allUsers);
        }),

      removeUser: id =>
        set(state => {
          const game = state.games[state.currentGame];
          game.allUsers = game.allUsers.filter(u => u.id !== id);
          assignColours(game.allUsers);
        }),

      setUserName: (id, newUserName) =>
        set(state => {
          const game = state.games[state.currentGame];
          const user = game.allUsers.find(u => u.id === id);
          if (user) {
            user.name = newUserName;
            game.allUsers.sort(orderBy(x => x.name));
            assignColours(game.allUsers);
          }
        }),

      setUserTeam: (id, newTeamName) =>
        set(state => {
          const game = state.games[state.currentGame];
          const user = game.allUsers.find(u => u.id === id);
          if (user) {
            user.team = newTeamName;
          }
        }),

      toggleUser: id =>
        set(state => {
          const game = state.games[state.currentGame];
          const user = game.allUsers.find(u => u.id === id);
          if (user) {
            user.checked = !user.checked;
            assignColours(game.allUsers);
          }
        }),

      prepareSpin: random =>
        set(state => {
          const game = state.games[state.currentGame];
          if (game.winningId !== null) {
            game.remainingUsers = game.remainingUsers.filter(u => u.id !== game.winningId);
          }
          if (game.remainingUsers.length > 0) {
            const length = game.remainingUsers.length;
            const winningIndex = Math.min(Math.floor(random * length), length - 1);
            game.winningId = game.remainingUsers[winningIndex].id;
          }
        }),

      beginSpin: () =>
        set(state => {
          const game = state.games[state.currentGame];
          if (game.remainingUsers.length > 0) {
            game.spinning = true;
          }
        }),

      endSpin: () =>
        set(state => {
          const game = state.games[state.currentGame];
          if (game.winningId !== null) {
            const user = game.remainingUsers.find(u => u.id === game.winningId);
            if (user) {
              game.winningName = user.name;
            }
          }
          game.spinning = false;
        }),

      reset: seed =>
        set(state => {
          const game = state.games[state.currentGame];
          game.remainingUsers = deepCopy(game.allUsers.filter(x => x.checked));
          game.winningId = null;
          game.winningName = null;
          game.seed = seed;
        }),

      addEndImageUrl: () =>
        set(state => {
          state.games[state.currentGame].endImageUrls.push({
            url: "",
            enabled: true
          });
        }),

      removeEndImageUrl: index =>
        set(state => {
          const game = state.games[state.currentGame];
          game.endImageUrls = game.endImageUrls.filter((_, idx) => idx !== index);
        }),

      setEndImageUrlValue: (index, url) =>
        set(state => {
          const imageUrl = state.games[state.currentGame].endImageUrls[index];
          if (imageUrl) {
            imageUrl.url = url;
          }
        }),

      setEndImageUrlEnabled: (index, enabled) =>
        set(state => {
          const imageUrl = state.games[state.currentGame].endImageUrls[index];
          if (imageUrl) {
            imageUrl.enabled = enabled;
          }
        }),

      importState: imported =>
        set(state => {
          const normalized = normalizeImportedState(imported);
          state.currentGame = normalized.currentGame;
          state.games = normalized.games;
          state.timerType = normalized.timerType;
          state.timerDuration = normalized.timerDuration;
          state.timerLimit = normalized.timerLimit;
        }),

      setTimerType: type =>
        set(state => {
          state.timerType = type;
        }),

      setTimerDuration: duration =>
        set(state => {
          state.timerDuration = duration;
        }),

      setTimerLimit: limit =>
        set(state => {
          state.timerLimit = limit;
        }),

      setWheelType: type =>
        set(state => {
          state.wheelType = type;
        })
    })),
    {
      name: "roulette",
      version: 7,
      storage: createJSONStorage(() => localStorage),
      migrate: (persistedState: unknown, version: number) => {
        let state = persistedState;

        if (!version || version === 0) {
          state = migrations.undefined(state as Parameters<typeof migrations.undefined>[0]);
          version = 4;
        }

        if (version === 2) {
          state = migrations[2](state as Parameters<(typeof migrations)[2]>[0]);
          version = 4;
        }

        if (version === 3) {
          state = migrations[3](state as Parameters<(typeof migrations)[3]>[0]);
          version = 4;
        }

        if (version === 4) {
          state = migrations[4](state as Parameters<(typeof migrations)[4]>[0]);
          version = 6;
        }

        if (version === 6) {
          if (state && typeof state === "object") {
            (state as Record<string, unknown>).wheelType = "old";
          }
          version = 7;
        }

        return state;
      }
    }
  )
);
