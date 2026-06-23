import type { RouletteUser } from "./RouletteUser";

interface EndImageUrl {
  url: string;
  enabled: boolean;
}

export interface RouletteGame {
  name: string;
  allUsers: RouletteUser[];
  remainingUsers: RouletteUser[];
  spinning: boolean;
  winningId: string | null;
  winningName: string | null;
  seed: number;
  endImageUrls: EndImageUrl[];
}
