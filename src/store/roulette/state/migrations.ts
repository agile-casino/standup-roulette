import type { RouletteState as v1state } from "./v1/RouletteState";
import type { RouletteState as v2state } from "./v2/RouletteState";
import type { RouletteState as v4state } from "./v4/RouletteState";

interface LegacyGame {
  endImageUrl?: string;
  endImageUrls?: v2state["games"][number]["endImageUrls"];
}

interface LegacyState {
  currentGame: number;
  games: Array<Omit<v2state["games"][number], "endImageUrls"> & LegacyGame>;
}

function toEndImageUrls(game: LegacyGame): v2state["games"][number]["endImageUrls"] {
  if (Array.isArray(game.endImageUrls) && game.endImageUrls.length > 0) {
    return game.endImageUrls.filter(x => x.url.trim().length > 0);
  }
  if (typeof game.endImageUrl === "string" && game.endImageUrl.trim().length > 0) {
    return [{ url: game.endImageUrl, enabled: true }];
  }
  return [];
}

export const migrations = {
  undefined: (old: v1state): v4state => ({
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
        endImageUrls: []
      }
    ],
    timerType: "off",
    timerDuration: 60,
    timerLimit: 60
  }),
  2: (state: LegacyState): v4state => {
    for (let i = 0; i < state.games.length; i++) {
      state.games[i].endImageUrls = toEndImageUrls(state.games[i]);
      state.games[i].name = `Game ${i + 1}`;
      state.games[i].spinning = false;
    }
    return {
      currentGame: state.currentGame,
      games: state.games as v4state["games"],
      timerType: "off",
      timerDuration: 60,
      timerLimit: 60
    };
  },
  3: (state: LegacyState): v4state => {
    for (let i = 0; i < state.games.length; i++) {
      state.games[i].endImageUrls = toEndImageUrls(state.games[i]);
    }
    return {
      currentGame: state.currentGame,
      games: state.games as v4state["games"],
      timerType: "off",
      timerDuration: 60,
      timerLimit: 60
    };
  },
  4: (state: v2state): v4state => {
    return {
      currentGame: state.currentGame,
      games: state.games,
      timerType: "off",
      timerDuration: 60,
      timerLimit: 60
    };
  }
};
