import { configureStore } from "@reduxjs/toolkit";
import { rouletteSlice } from "./roulette/rouletteSlice";
import { persist } from "./persist";

export const store = configureStore({
  reducer: {
    roulette: persist(rouletteSlice.reducer, { key: "roulette", exclude: ["spinning"] })
  }
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
