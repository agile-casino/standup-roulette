import { MascotApi } from "../../../../components/SettingsPanel";
import type { RouletteUser } from "./RouletteUser";

export interface RouletteGame {
  name: string;
  allUsers: RouletteUser[];
  remainingUsers: RouletteUser[];
  spinning: boolean;
  winningId: string | null;
  winningName: string | null;
  seed: number;
  endImageUrl: string;
  mascotApi: MascotApi;
}
