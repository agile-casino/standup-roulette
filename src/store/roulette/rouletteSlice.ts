import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import { v4 as uuidv4 } from "uuid";
import { getColourScheme } from "../../utils/colourScheme";
import { deepCopy } from "../../utils/deepCopy";
import { orderBy } from "../../utils/orderBy";
import type { RootState } from "../index";
import type { EndImageUrl, RouletteState, RouletteUser } from "./state";

const uuid = uuidv4 as () => string;

function createInitialGame(name: string) {
  return {
    name,
    allUsers: [],
    remainingUsers: [],
    spinning: false,
    winningId: null,
    winningName: null,
    seed: 0,
    endImageUrls: []
  };
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
      games: [createInitialGame("Game 1")]
    };
  }

  const importedState = state as { currentGame?: number; games: Array<Record<string, unknown>> };
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
    games.push(createInitialGame("Game 1"));
  }

  const requestedCurrentGame = typeof importedState.currentGame === "number" ? importedState.currentGame : 0;
  const currentGame = Math.min(Math.max(Math.floor(requestedCurrentGame), 0), games.length - 1);

  return {
    currentGame,
    games
  };
}

const initialState: RouletteState = {
  currentGame: 0,
  games: [createInitialGame("Game 1")]
};

function assignColours(users: RouletteUser[]): void {
  const selectedUsers = users.filter(x => x.checked);
  const colours = getColourScheme(selectedUsers.length);
  for (let i = 0; i < colours.length; i++) {
    selectedUsers[i].colour = colours[i];
  }
}

export const rouletteSlice = createSlice({
  name: "roulette",
  initialState: initialState,
  reducers: {
    setGameName: (state, action: PayloadAction<{ name: string }>) => {
      state.games[state.currentGame].name = action.payload.name;
    },
    prevGame: state => {
      if (state.games[state.currentGame].spinning) {
        return;
      }
      const index = Math.max(state.currentGame - 1, 0);
      if (!state.games[index]) {
        state.games[index] = createInitialGame(`Game ${index + 1}`);
      }
      state.currentGame = index;
    },
    nextGame: state => {
      if (state.games[state.currentGame].spinning) {
        return;
      }
      const index = Math.min(state.currentGame + 1, 4);
      if (!state.games[index]) {
        state.games[index] = createInitialGame(`Game ${index + 1}`);
      }
      state.currentGame = index;
    },
    addUser: (state, action: PayloadAction<{ name: string }>) => {
      state.games[state.currentGame].allUsers = [...state.games[state.currentGame].allUsers, { id: uuid(), name: action.payload.name, checked: true }].sort(orderBy(x => x.name));
      assignColours(state.games[state.currentGame].allUsers);
    },
    removeUser: (state, action: PayloadAction<{ id: string }>) => {
      state.games[state.currentGame].allUsers = state.games[state.currentGame].allUsers.filter(u => u.id !== action.payload.id);
      assignColours(state.games[state.currentGame].allUsers);
    },
    setUserName: (state, action: PayloadAction<{ id: string; newUserName: string }>) => {
      const user = state.games[state.currentGame].allUsers.find(u => u.id === action.payload.id);
      if (user) {
        user.name = action.payload.newUserName;
        state.games[state.currentGame].allUsers = state.games[state.currentGame].allUsers.toSorted(orderBy(x => x.name));
        assignColours(state.games[state.currentGame].allUsers);
      }
    },
    setUserTeam: (state, action: PayloadAction<{ id: string; newTeamName: string }>) => {
      const user = state.games[state.currentGame].allUsers.find(u => u.id === action.payload.id);
      if (user) {
        user.team = action.payload.newTeamName;
      }
    },
    toggleUser: (state, action: PayloadAction<{ id: string }>) => {
      const user = state.games[state.currentGame].allUsers.find(u => u.id === action.payload.id);
      if (user) {
        user.checked = !user.checked;
        assignColours(state.games[state.currentGame].allUsers);
      }
    },
    prepareSpin: (state, action: PayloadAction<{ random: number }>) => {
      if (state.games[state.currentGame].winningId !== null) {
        const newRemainingUsers = state.games[state.currentGame].remainingUsers.filter(u => u.id !== state.games[state.currentGame].winningId);
        state.games[state.currentGame].remainingUsers = newRemainingUsers;
      }
      if (state.games[state.currentGame].remainingUsers.length > 0) {
        const length = state.games[state.currentGame].remainingUsers.length;
        const winningIndex = Math.min(Math.floor(action.payload.random * length), length - 1);
        state.games[state.currentGame].winningId = state.games[state.currentGame].remainingUsers[winningIndex].id;
      }
    },
    beginSpin: state => {
      if (state.games[state.currentGame].remainingUsers.length > 0) {
        state.games[state.currentGame].spinning = true;
      }
    },
    endSpin: state => {
      if (state.games[state.currentGame].winningId !== null) {
        const user = state.games[state.currentGame].remainingUsers.find(u => u.id === state.games[state.currentGame].winningId);
        if (user) {
          state.games[state.currentGame].winningName = user.name;
        }
      }
      state.games[state.currentGame].spinning = false;
    },
    reset: (state, action: PayloadAction<{ seed: number }>) => {
      state.games[state.currentGame].remainingUsers = deepCopy(state.games[state.currentGame].allUsers.filter(x => x.checked));
      state.games[state.currentGame].winningId = null;
      state.games[state.currentGame].winningName = null;
      state.games[state.currentGame].seed = action.payload.seed;
    },
    addEndImageUrl: state => {
      state.games[state.currentGame].endImageUrls.push({ url: "", enabled: true });
    },
    removeEndImageUrl: (state, action: PayloadAction<{ index: number }>) => {
      state.games[state.currentGame].endImageUrls = state.games[state.currentGame].endImageUrls.filter((_, index) => index !== action.payload.index);
    },
    setEndImageUrlValue: (state, action: PayloadAction<{ index: number; url: string }>) => {
      const imageUrl = state.games[state.currentGame].endImageUrls[action.payload.index];
      if (imageUrl) {
        imageUrl.url = action.payload.url;
      }
    },
    setEndImageUrlEnabled: (state, action: PayloadAction<{ index: number; enabled: boolean }>) => {
      const imageUrl = state.games[state.currentGame].endImageUrls[action.payload.index];
      if (imageUrl) {
        imageUrl.enabled = action.payload.enabled;
      }
    },
    importState: (_, action: PayloadAction<unknown>) => {
      return normalizeImportedState(action.payload);
    }
  }
});

export const { setGameName, prevGame, nextGame, addUser, removeUser, setUserName, setUserTeam, toggleUser, reset, prepareSpin, beginSpin, endSpin, addEndImageUrl, removeEndImageUrl, setEndImageUrlValue, setEndImageUrlEnabled, importState } =
  rouletteSlice.actions;

export const selectGameName = (state: RootState) => state.roulette.games[state.roulette.currentGame].name;
export const selectAllUsers = (state: RootState) => state.roulette.games[state.roulette.currentGame].allUsers;
export const selectRemainingUsers = (state: RootState) => state.roulette.games[state.roulette.currentGame].remainingUsers;
export const selectSpinning = (state: RootState) => state.roulette.games[state.roulette.currentGame].spinning;
export const selectWinningId = (state: RootState) => state.roulette.games[state.roulette.currentGame].winningId;
export const selectWinningName = (state: RootState) => state.roulette.games[state.roulette.currentGame].winningName;
export const selectSeed = (state: RootState) => state.roulette.games[state.roulette.currentGame].seed;
export const selectEndImageUrls = (state: RootState) => state.roulette.games[state.roulette.currentGame].endImageUrls;
