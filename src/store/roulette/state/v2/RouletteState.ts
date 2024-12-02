import type { RouletteGame } from "./RouletteGame";

export interface RouletteState {
  currentGame: number;
  games: RouletteGame[];
}
