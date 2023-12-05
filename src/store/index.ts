import { configureStore } from "@reduxjs/toolkit";
import { rouletteSlice } from "./roulette/rouletteSlice";
import { migrations } from "./roulette/state/migrations";
import { persist } from "./persist";

export const store = configureStore({
  reducer: {
    roulette: persist(rouletteSlice.reducer, { key: "roulette", version: 2, migrations: migrations })
  }
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
