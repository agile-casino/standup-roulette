import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { RootState } from "../index";
import { getColourScheme } from "../../utils/colourScheme";
import { orderBy } from "../../utils/orderBy";
import { deepCopy } from "../../utils/deepCopy";
import { User } from "./User";
import { v4 as uuidv4 } from "uuid";

const uuid = uuidv4 as () => string;

interface RouletteState {
  allUsers: User[];
  remainingUsers: User[];
  spinning: boolean;
  winningId: string | null;
  winningName: string | null;
  seed: number;
}

const initialState: RouletteState = {
  allUsers: [],
  remainingUsers: [],
  spinning: false,
  winningId: null,
  winningName: null,
  seed: 0
};

function assignColours(users: User[]): void {
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
    addUser: (state, action: PayloadAction<{ name: string }>) => {
      state.allUsers = [...state.allUsers, { id: uuid(), name: action.payload.name }].sort(orderBy((x) => x.name));
      assignColours(state.allUsers);
    },
    removeUser: (state, action: PayloadAction<{ id: string }>) => {
      state.allUsers = state.allUsers.filter((u) => u.id !== action.payload.id);
      assignColours(state.allUsers);
    },
    setUserName: (state, action: PayloadAction<{ id: string; newUserName: string }>) => {
      const user = state.allUsers.find((u) => u.id === action.payload.id);
      if (user) {
        user.name = action.payload.newUserName;
        state.allUsers = state.allUsers.sort(orderBy((x) => x.name));
        assignColours(state.allUsers);
      }
    },
    setUserTeam: (state, action: PayloadAction<{ id: string; newTeamName: string }>) => {
      const user = state.allUsers.find((u) => u.id === action.payload.id);
      if (user) {
        user.team = action.payload.newTeamName;
      }
    },
    toggleUser: (state, action: PayloadAction<{ id: string }>) => {
      const user = state.allUsers.find((u) => u.id === action.payload.id);
      if (user) {
        user.checked = !user.checked;
        assignColours(state.allUsers);
      }
    },
    prepareSpin: (state, action: PayloadAction<{ random: number }>) => {
      if (state.winningId !== null) {
        const newRemainingUsers = state.remainingUsers.filter((u) => u.id !== state.winningId);
        state.remainingUsers = newRemainingUsers;
      }
      if (state.remainingUsers.length > 0) {
        const winningIndex = Math.floor(action.payload.random * state.remainingUsers.length);
        state.winningId = state.remainingUsers[winningIndex].id;
      }
    },
    beginSpin: (state) => {
      if (state.remainingUsers.length > 0) {
        state.spinning = true;
      }
    },
    endSpin: (state) => {
      if (state.winningId !== null) {
        const user = state.remainingUsers.find((u) => u.id === state.winningId);
        if (user) {
          state.winningName = user.name;
        }
      }
      state.spinning = false;
    },
    reset: (state, action: PayloadAction<{ seed: number }>) => {
      state.remainingUsers = deepCopy(state.allUsers.filter((x) => x.checked));
      state.winningId = null;
      state.winningName = null;
      state.seed = action.payload.seed
    }
  }
});

export const { addUser, removeUser, setUserName, setUserTeam, toggleUser, reset, prepareSpin, beginSpin, endSpin } = rouletteSlice.actions;

export const selectAllUsers = (state: RootState) => state.roulette.allUsers;
export const selectRemainingUsers = (state: RootState) => state.roulette.remainingUsers;
export const selectSpinning = (state: RootState) => state.roulette.spinning;
export const selectWinningId = (state: RootState) => state.roulette.winningId;
export const selectWinningName = (state: RootState) => state.roulette.winningName;
export const selectSeed = (state: RootState) => state.roulette.seed;