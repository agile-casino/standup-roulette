import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { RootState } from "../index";
import { getColourScheme } from "../../utils/colourScheme";
import { orderBy } from "../../utils/orderBy";
import { deepCopy } from "../../utils/deepCopy";
import { RouletteState } from "./state";
import { RouletteUser } from "./state";
import { v4 as uuidv4 } from "uuid";
import { commentate } from "../../utils/narrator";

const uuid = uuidv4 as () => string;

const initialState: RouletteState = {
  currentGame: 0,
  games: [
    {
      allUsers: [],
      remainingUsers: [],
      spinning: false,
      winningId: null,
      winningName: null,
      seed: 0
    }
  ]
};

function assignColours(users: RouletteUser[]): void {
  const selectedUsers = users.filter((x) => x.checked);
  const colours = getColourScheme(selectedUsers.length);
  for (let i = 0; i < colours.length; i++) {
    selectedUsers[i].colour = colours[i];
  }
}

export const rouletteSlice = createSlice({
  name: "roulette",
  initialState: initialState,
  reducers: {
    prevGame: (state) => {
      if (state.games[state.currentGame].spinning) {
        return;
      }
      const index = Math.max(state.currentGame - 1, 0);
      if (!state.games[index]) {
        state.games[index] = {
          allUsers: [],
          remainingUsers: [],
          spinning: false,
          winningId: null,
          winningName: null,
          seed: 0
        };
      }
      state.currentGame = index;
    },
    nextGame: (state) => {
      if (state.games[state.currentGame].spinning) {
        return;
      }
      const index = Math.min(state.currentGame + 1, 4);
      if (!state.games[index]) {
        state.games[index] = {
          allUsers: [],
          remainingUsers: [],
          spinning: false,
          winningId: null,
          winningName: null,
          seed: 0
        };
      }
      state.currentGame = index;
    },
    addUser: (state, action: PayloadAction<{ name: string }>) => {
      state.games[state.currentGame].allUsers = [...state.games[state.currentGame].allUsers, { id: uuid(), name: action.payload.name }].sort(orderBy((x) => x.name));
      assignColours(state.games[state.currentGame].allUsers);
    },
    removeUser: (state, action: PayloadAction<{ id: string }>) => {
      state.games[state.currentGame].allUsers = state.games[state.currentGame].allUsers.filter((u) => u.id !== action.payload.id);
      assignColours(state.games[state.currentGame].allUsers);
    },
    setUserName: (state, action: PayloadAction<{ id: string; newUserName: string }>) => {
      const user = state.games[state.currentGame].allUsers.find((u) => u.id === action.payload.id);
      if (user) {
        user.name = action.payload.newUserName;
        state.games[state.currentGame].allUsers = state.games[state.currentGame].allUsers.sort(orderBy((x) => x.name));
        assignColours(state.games[state.currentGame].allUsers);
      }
    },
    setUserTeam: (state, action: PayloadAction<{ id: string; newTeamName: string }>) => {
      const user = state.games[state.currentGame].allUsers.find((u) => u.id === action.payload.id);
      if (user) {
        user.team = action.payload.newTeamName;
      }
    },
    toggleUser: (state, action: PayloadAction<{ id: string }>) => {
      const user = state.games[state.currentGame].allUsers.find((u) => u.id === action.payload.id);
      if (user) {
        user.checked = !user.checked;
        assignColours(state.games[state.currentGame].allUsers);
      }
    },
    prepareSpin: (state, action: PayloadAction<{ random: number }>) => {
      if (state.games[state.currentGame].winningId !== null) {
        const newRemainingUsers = state.games[state.currentGame].remainingUsers.filter((u) => u.id !== state.games[state.currentGame].winningId);
        state.games[state.currentGame].remainingUsers = newRemainingUsers;
      }
      if (state.games[state.currentGame].remainingUsers.length > 0) {
        const winningIndex = Math.floor(action.payload.random * state.games[state.currentGame].remainingUsers.length);
        state.games[state.currentGame].winningId = state.games[state.currentGame].remainingUsers[winningIndex].id;
      }
    },
    beginSpin: (state) => {
      if (state.games[state.currentGame].remainingUsers.length > 0) {
        state.games[state.currentGame].spinning = true;
      }
    },
    endSpin: (state) => {
      if (state.games[state.currentGame].winningId !== null) {
        const user = state.games[state.currentGame].remainingUsers.find((u) => u.id === state.games[state.currentGame].winningId);
        if (user) {
          state.games[state.currentGame].winningName = user.name;

          if (state.narrator) {
            commentate(user.name, state.games[state.currentGame].allUsers.length - state.games[state.currentGame].remainingUsers.length,  state.games[state.currentGame].allUsers.length);
          }
        }
      }
      state.games[state.currentGame].spinning = false;
    },
    reset: (state, action: PayloadAction<{ seed: number }>) => {
      state.games[state.currentGame].remainingUsers = deepCopy(state.games[state.currentGame].allUsers.filter((x) => x.checked));
      state.games[state.currentGame].winningId = null;
      state.games[state.currentGame].winningName = null;
      state.games[state.currentGame].seed = action.payload.seed;
    },
    toggleNarrator: (state) => {
      state.narrator = !state.narrator;
    }
  }
});

export const { prevGame, nextGame, addUser, removeUser, setUserName, setUserTeam, toggleUser, reset, prepareSpin, beginSpin, endSpin, toggleNarrator } = rouletteSlice.actions;

export const selectGame = (state: RootState) => state.roulette.currentGame;
export const selectAllUsers = (state: RootState) => state.roulette.games[state.roulette.currentGame].allUsers;
export const selectRemainingUsers = (state: RootState) => state.roulette.games[state.roulette.currentGame].remainingUsers;
export const selectSpinning = (state: RootState) => state.roulette.games[state.roulette.currentGame].spinning;
export const selectWinningId = (state: RootState) => state.roulette.games[state.roulette.currentGame].winningId;
export const selectWinningName = (state: RootState) => state.roulette.games[state.roulette.currentGame].winningName;
export const selectSeed = (state: RootState) => state.roulette.games[state.roulette.currentGame].seed;
export const selectNarrator = (state: RootState) => !!state.roulette.narrator;