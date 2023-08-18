import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { RootState } from "../index";
import { getColourScheme } from "../../utils/colourScheme";
import { orderBy } from "../../utils/orderBy";
import { deepCopy } from "../../utils/deepCopy";
import { User } from "./User";
import { getLocalStorage, setLocalStorage } from "../../utils/localStorage";
import { v4 as uuidv4 } from "uuid";

const uuid = uuidv4 as () => string;

export interface RouletteState {
  allUsers: User[];
  remainingUsers: User[];
  spinning: boolean;
  winningIndex: number | null;
  winningName: string | null;
}

function importLegacyState(): RouletteState {
  const state: RouletteState = {
    allUsers: getLocalStorage<User[]>("standup-roulette:allUsers", []),
    remainingUsers: getLocalStorage<User[]>("standup-roulette:remainingUsers", []),
    spinning: false,
    winningIndex: getLocalStorage<number | null>("standup-roulette:winningIndex", null),
    winningName: getLocalStorage<string | null>("standup-roulette:winningName", null)
  };

  for (const user of state.allUsers) {
    if (!user.id) {
      user.id = uuid();
    }
  }

  for (const user of state.remainingUsers) {
    const matchingUser = state.allUsers.find(u => u.name === user.name);
    user.id = matchingUser?.id ?? uuid();
  }

  return state;
}

const initialState: RouletteState = importLegacyState();

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
      setLocalStorage("standup-roulette:allUsers", state.allUsers);
    },
    removeUser: (state, action: PayloadAction<{ id: string }>) => {
      state.allUsers = state.allUsers.filter(u => u.id !== action.payload.id);
      assignColours(state.allUsers);
      setLocalStorage("standup-roulette:allUsers", state.allUsers);
    },
    setUserName: (state, action: PayloadAction<{ id: string; newUserName: string }>) => {
      const user = state.allUsers.find(u => u.id === action.payload.id);
      if (user) {
        user.name = action.payload.newUserName;
        state.allUsers = state.allUsers.sort(orderBy((x) => x.name));
        assignColours(state.allUsers);
        setLocalStorage("standup-roulette:allUsers", state.allUsers);
      }
    },
    setUserTeam: (state, action: PayloadAction<{ id: string; newTeamName: string }>) => {
      const user = state.allUsers.find(u => u.id === action.payload.id);
      if (user) {
        user.team = action.payload.newTeamName;
        setLocalStorage("standup-roulette:allUsers", state.allUsers);
      }
    },
    toggleUser: (state, action: PayloadAction<{ id: string }>) => {
      const user = state.allUsers.find(u => u.id === action.payload.id);
      if (user) {
        user.checked = !user.checked;
        assignColours(state.allUsers);
        setLocalStorage("standup-roulette:allUsers", state.allUsers);
      }
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
