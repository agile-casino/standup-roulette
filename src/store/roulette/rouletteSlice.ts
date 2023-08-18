import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import type { RootState } from "../index";
import { getColourScheme } from "../../utils/colourScheme";
import { orderBy } from "../../utils/orderBy";
import { deepCopy } from "../../utils/deepCopy";
import { User } from "./User";
import { getLocalStorage, setLocalStorage } from "../../utils/localStorage";

export interface RouletteState {
  allUsers: User[];
  remainingUsers: User[];
  spinning: boolean;
  winningIndex: number | null;
  winningName: string | null;
}

const initialState: RouletteState = {
  allUsers: getLocalStorage<User[]>("standup-roulette:allUsers", []),
  remainingUsers: getLocalStorage<User[]>("standup-roulette:remainingUsers", []),
  spinning: false,
  winningIndex: getLocalStorage<number | null>("standup-roulette:winningIndex", null),
  winningName: getLocalStorage<string | null>("standup-roulette:winningName", null)
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
      state.allUsers = [...state.allUsers, { name: action.payload.name }].sort(orderBy((x) => x.name));
      assignColours(state.allUsers);
      setLocalStorage("standup-roulette:allUsers", state.allUsers);
    },
    removeUser: (state, action: PayloadAction<{ index: number }>) => {
      state.allUsers = state.allUsers.filter((_, index) => index !== action.payload.index);
      assignColours(state.allUsers);
      setLocalStorage("standup-roulette:allUsers", state.allUsers);
    },
    setUserName: (state, action: PayloadAction<{ index: number; newUserName: string }>) => {
      state.allUsers[action.payload.index].name = action.payload.newUserName;
      state.allUsers = state.allUsers.sort(orderBy((x) => x.name));
      assignColours(state.allUsers);
      setLocalStorage("standup-roulette:allUsers", state.allUsers);
    },
    setUserTeam: (state, action: PayloadAction<{ index: number; newTeamName: string }>) => {
      state.allUsers[action.payload.index].team = action.payload.newTeamName;
      setLocalStorage("standup-roulette:allUsers", state.allUsers);
    },
    toggleUser: (state, action: PayloadAction<{ index: number }>) => {
      state.allUsers[action.payload.index].checked = !state.allUsers[action.payload.index].checked;
      assignColours(state.allUsers);
      setLocalStorage("standup-roulette:allUsers", state.allUsers);
    },
    prepareSpin: (state) => {
      if (state.winningIndex !== null) {
        const newRemainingUsers = state.remainingUsers.filter((_, i) => i !== state.winningIndex);
        state.remainingUsers = newRemainingUsers;
      }
      state.winningIndex = Math.floor(Math.random() * state.remainingUsers.length);
      setLocalStorage("standup-roulette:remainingUsers", state.remainingUsers);
      setLocalStorage("standup-roulette:winningIndex", state.winningIndex);
    },
    beginSpin: (state) => {
      state.spinning = true;
    },
    endSpin: (state) => {
      if (state.winningIndex !== null) {
        state.winningName = state.remainingUsers[state.winningIndex].name;
      }
      state.spinning = false;
      setLocalStorage("standup-roulette:winningName", state.winningName);
    },
    reset: (state) => {
      state.remainingUsers = deepCopy(state.allUsers);
      state.winningIndex = null;
      state.winningName = null;
      setLocalStorage("standup-roulette:remainingUsers", state.remainingUsers);
      setLocalStorage("standup-roulette:winningIndex", state.winningIndex);
      setLocalStorage("standup-roulette:winningName", state.winningName);
    }
  }
});

export const { addUser, removeUser, setUserName, setUserTeam, toggleUser, reset, prepareSpin, beginSpin, endSpin } = rouletteSlice.actions;

export const selectAllUsers = (state: RootState) => state.roulette.allUsers;
export const selectRemainingUsers = (state: RootState) => state.roulette.remainingUsers;
export const selectSpinning = (state: RootState) => state.roulette.spinning;
export const selectWinningIndex = (state: RootState) => state.roulette.winningIndex;
export const selectWinningName = (state: RootState) => state.roulette.winningName;

export default rouletteSlice.reducer;
