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
    for (let i = 0; i < state.games.length; i++) {
      state.games[i].endImageUrl = "";
      state.games[i].name = `Game ${i + 1}`;
      state.games[i].spinning = false;
    }
    return state;
  }
};
