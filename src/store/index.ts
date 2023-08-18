import { configureStore } from "@reduxjs/toolkit";
import { rouletteSlice } from "./roulette/rouletteSlice";

export const store = configureStore({
  reducer: {
    roulette: rouletteSlice.reducer
  }
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
