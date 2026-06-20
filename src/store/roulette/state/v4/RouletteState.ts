import type { RouletteGame } from "./RouletteGame";

export interface RouletteState {
  currentGame: number;
  games: RouletteGame[];
  timerType: "off" | "up" | "down";
  timerDuration: number;
  timerLimit: number;
}
