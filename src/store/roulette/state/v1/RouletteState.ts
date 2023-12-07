import { RouletteUser } from "./RouletteUser";

export interface RouletteState {
  allUsers: RouletteUser[];
  remainingUsers: RouletteUser[];
  spinning: boolean;
  winningId: string | null;
  winningName: string | null;
  seed: number;
}
