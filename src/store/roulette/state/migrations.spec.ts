import { describe, expect, it } from "vitest";
import { migrations } from "./migrations";

describe("roulette state migrations", () => {
  describe("version 3", () => {
    it("migrates legacy single end image url to a list entry", () => {
      const state = {
        currentGame: 0,
        games: [
          {
            name: "Game 1",
            allUsers: [],
            remainingUsers: [],
            spinning: false,
            winningId: null,
            winningName: null,
            seed: 0,
            endImageUrl: "https://example.com/end.png"
          }
        ]
      };

      const result = migrations[3]?.(state);

      expect(result?.games[0].endImageUrls).toEqual([{ url: "https://example.com/end.png", enabled: true }]);
    });

    it("keeps fallback list empty when legacy single url is not configured", () => {
      const state = {
        currentGame: 0,
        games: [
          {
            name: "Game 1",
            allUsers: [],
            remainingUsers: [],
            spinning: false,
            winningId: null,
            winningName: null,
            seed: 0,
            endImageUrl: ""
          }
        ]
      };

      const result = migrations[3]?.(state);

      expect(result?.games[0].endImageUrls).toEqual([]);
    });
  });
});
