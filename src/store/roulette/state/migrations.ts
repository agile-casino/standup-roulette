import type { RouletteState as v1state } from "./v1/RouletteState";
import type { RouletteState as v2state } from "./v2/RouletteState";

export const migrations = {
  undefined: (old: v1state): v2state => ({
    currentGame: 0,
    games: [
      {
        name: "Game 1",
        allUsers: old.allUsers,
        remainingUsers: old.remainingUsers,
        seed: old.seed,
        spinning: old.spinning,
        winningId: old.winningId,
        winningName: old.winningName,
        endImageUrl: ""
      }
    ]
  }),
  2: (state: v2state): v2state => {
    state.games.forEach(game => game.spinning = false);
    state.games.forEach((game, index) => game.name = `Game ${index + 1}`);
    state.games.forEach(game => game.endImageUrl = "");
    return state;
  }
};
