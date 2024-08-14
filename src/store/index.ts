import { configureStore } from "@reduxjs/toolkit";
import { persist } from "./persist";
import { rouletteSlice } from "./roulette/rouletteSlice";
import { migrations } from "./roulette/state/migrations";

export const store = configureStore({
  reducer: {
    roulette: persist(rouletteSlice.reducer, { key: "roulette", version: 3, migrations: migrations })
  }
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
