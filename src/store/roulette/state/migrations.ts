import { RouletteState as v1state } from "./v1/RouletteState";
import { RouletteState as v2state } from "./v2/RouletteState";

export const migrations = {
  undefined: function (old: v1state): v2state {
    return {
      currentGame: 0,
      games: [
        {
          name: "Game 1",
          allUsers: old.allUsers,
          remainingUsers: old.remainingUsers,
          seed: old.seed,
          spinning: old.spinning,
          winningId: old.winningId,
          winningName: old.winningName
        }
      ]
    };
  },
  2: function (state: v2state): v2state {
    state.games.forEach(game => game.spinning = false);
    state.games.forEach((game, index) => game.name = `Game ${index + 1}`);
    return state;
  }
};
