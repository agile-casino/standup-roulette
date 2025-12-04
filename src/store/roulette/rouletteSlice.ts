import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import { v4 as uuidv4 } from "uuid";
import { getColourScheme } from "../../utils/colourScheme";
import { deepCopy } from "../../utils/deepCopy";
import { orderBy } from "../../utils/orderBy";
import type { RootState } from "../index";
import type { RouletteState, RouletteUser } from "./state";
import { MascotApi } from "../../models/MascotApi";

const uuid = uuidv4 as () => string;

const initialState: RouletteState = {
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
      endImageUrl: "",
      mascotApi: MascotApi.Pokémon
    }
  ]
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
        state.games[index] = {
          name: `Game ${index + 1}`,
          allUsers: [],
          remainingUsers: [],
          spinning: false,
          winningId: null,
          winningName: null,
          seed: 0,
          endImageUrl: "",
          mascotApi: MascotApi.Pokémon
        };
      }
      state.currentGame = index;
    },
    nextGame: state => {
      if (state.games[state.currentGame].spinning) {
        return;
      }
      const index = Math.min(state.currentGame + 1, 4);
      if (!state.games[index]) {
        state.games[index] = {
          name: `Game ${index + 1}`,
          allUsers: [],
          remainingUsers: [],
          spinning: false,
          winningId: null,
          winningName: null,
          seed: 0,
          endImageUrl: "",
          mascotApi: MascotApi.Pokémon
        };
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
    setEndImageUrl: (state, action: PayloadAction<{ url: string }>) => {
      state.games[state.currentGame].endImageUrl = action.payload.url;
    },
    setMascotApi: (state, action: PayloadAction<{ api: MascotApi }>) => {
      state.games[state.currentGame].mascotApi = action.payload.api;
    },
    importState: (_, action: PayloadAction<RouletteState>) => {
      return action.payload;
    }
  }
});

export const { setGameName, prevGame, nextGame, addUser, removeUser, setUserName, setUserTeam, toggleUser, reset, prepareSpin, beginSpin, endSpin, setEndImageUrl, setMascotApi, importState } = rouletteSlice.actions;

export const selectGameName = (state: RootState) => state.roulette.games[state.roulette.currentGame].name;
export const selectAllUsers = (state: RootState) => state.roulette.games[state.roulette.currentGame].allUsers;
export const selectRemainingUsers = (state: RootState) => state.roulette.games[state.roulette.currentGame].remainingUsers;
export const selectSpinning = (state: RootState) => state.roulette.games[state.roulette.currentGame].spinning;
export const selectWinningId = (state: RootState) => state.roulette.games[state.roulette.currentGame].winningId;
export const selectWinningName = (state: RootState) => state.roulette.games[state.roulette.currentGame].winningName;
export const selectSeed = (state: RootState) => state.roulette.games[state.roulette.currentGame].seed;
export const selectEndImageUrl = (state: RootState) => state.roulette.games[state.roulette.currentGame].endImageUrl;
export const selectMascotApi = (state: RootState) => state.roulette.games[state.roulette.currentGame].mascotApi;