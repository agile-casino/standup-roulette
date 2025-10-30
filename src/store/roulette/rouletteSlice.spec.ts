import { describe, expect, it } from "vitest";
import { prepareSpin, rouletteSlice } from "./rouletteSlice";
import type { RouletteState } from "./state";

describe("rouletteSlice", () => {
  describe("prepareSpin", () => {
    describe("when selecting a winner with random values", () => {
      it("should handle random = 0.0 correctly", () => {
        const initialState: RouletteState = {
          currentGame: 0,
          games: [
            {
              name: "Test Game",
              allUsers: [
                { id: "1", name: "Alice", checked: true, colour: "#FF0000" },
                { id: "2", name: "Bob", checked: true, colour: "#00FF00" },
                { id: "3", name: "Charlie", checked: true, colour: "#0000FF" }
              ],
              remainingUsers: [
                { id: "1", name: "Alice", checked: true, colour: "#FF0000" },
                { id: "2", name: "Bob", checked: true, colour: "#00FF00" },
                { id: "3", name: "Charlie", checked: true, colour: "#0000FF" }
              ],
              spinning: false,
              winningId: null,
              winningName: null,
              seed: 0,
              endImageUrl: ""
            }
          ]
        };

        const action = prepareSpin({ random: 0.0 });
        const newState = rouletteSlice.reducer(initialState, action);

        expect(newState.games[0].winningId).toBe("1");
      });

      it("should handle random = 0.5 correctly", () => {
        const initialState: RouletteState = {
          currentGame: 0,
          games: [
            {
              name: "Test Game",
              allUsers: [
                { id: "1", name: "Alice", checked: true, colour: "#FF0000" },
                { id: "2", name: "Bob", checked: true, colour: "#00FF00" },
                { id: "3", name: "Charlie", checked: true, colour: "#0000FF" },
                { id: "4", name: "Dave", checked: true, colour: "#FFFF00" }
              ],
              remainingUsers: [
                { id: "1", name: "Alice", checked: true, colour: "#FF0000" },
                { id: "2", name: "Bob", checked: true, colour: "#00FF00" },
                { id: "3", name: "Charlie", checked: true, colour: "#0000FF" },
                { id: "4", name: "Dave", checked: true, colour: "#FFFF00" }
              ],
              spinning: false,
              winningId: null,
              winningName: null,
              seed: 0,
              endImageUrl: ""
            }
          ]
        };

        const action = prepareSpin({ random: 0.5 });
        const newState = rouletteSlice.reducer(initialState, action);

        expect(newState.games[0].winningId).toBe("3");
      });

      it("should handle random = 0.99999 correctly", () => {
        const initialState: RouletteState = {
          currentGame: 0,
          games: [
            {
              name: "Test Game",
              allUsers: [
                { id: "1", name: "Alice", checked: true, colour: "#FF0000" },
                { id: "2", name: "Bob", checked: true, colour: "#00FF00" },
                { id: "3", name: "Charlie", checked: true, colour: "#0000FF" }
              ],
              remainingUsers: [
                { id: "1", name: "Alice", checked: true, colour: "#FF0000" },
                { id: "2", name: "Bob", checked: true, colour: "#00FF00" },
                { id: "3", name: "Charlie", checked: true, colour: "#0000FF" }
              ],
              spinning: false,
              winningId: null,
              winningName: null,
              seed: 0,
              endImageUrl: ""
            }
          ]
        };

        const action = prepareSpin({ random: 0.99999 });
        const newState = rouletteSlice.reducer(initialState, action);

        // Should select the last user (Charlie at index 2)
        expect(newState.games[0].winningId).toBe("3");
      });

      it("should handle random = 1.0 correctly without going out of bounds", () => {
        const initialState: RouletteState = {
          currentGame: 0,
          games: [
            {
              name: "Test Game",
              allUsers: [
                { id: "1", name: "Alice", checked: true, colour: "#FF0000" },
                { id: "2", name: "Bob", checked: true, colour: "#00FF00" },
                { id: "3", name: "Charlie", checked: true, colour: "#0000FF" }
              ],
              remainingUsers: [
                { id: "1", name: "Alice", checked: true, colour: "#FF0000" },
                { id: "2", name: "Bob", checked: true, colour: "#00FF00" },
                { id: "3", name: "Charlie", checked: true, colour: "#0000FF" }
              ],
              spinning: false,
              winningId: null,
              winningName: null,
              seed: 0,
              endImageUrl: ""
            }
          ]
        };

        const action = prepareSpin({ random: 1.0 });
        const newState = rouletteSlice.reducer(initialState, action);

        // Should clamp to the last valid index and select Charlie
        expect(newState.games[0].winningId).toBe("3");
      });
    });

    describe("when testing fairness over many iterations", () => {
      it("should distribute selections fairly across all users", () => {
        const userIds = ["1", "2", "3", "4"];
        const users = userIds.map((id, index) => ({
          id,
          name: `User${index}`,
          checked: true,
          colour: "#000000"
        }));

        const selectionCounts: Record<string, number> = {
          "1": 0,
          "2": 0,
          "3": 0,
          "4": 0
        };

        const iterations = 10000;

        for (let i = 0; i < iterations; i++) {
          const initialState: RouletteState = {
            currentGame: 0,
            games: [
              {
                name: "Test Game",
                allUsers: users,
                remainingUsers: [...users],
                spinning: false,
                winningId: null,
                winningName: null,
                seed: 0,
                endImageUrl: ""
              }
            ]
          };

          const random = Math.random();
          const action = prepareSpin({ random });
          const newState = rouletteSlice.reducer(initialState, action);

          if (newState.games[0].winningId) {
            selectionCounts[newState.games[0].winningId]++;
          }
        }

        // Each user should be selected approximately 25% of the time (within 2% tolerance)
        const expectedPercentage = 25;
        const tolerance = 2;

        for (const id of userIds) {
          const percentage = (selectionCounts[id] / iterations) * 100;
          expect(percentage).toBeGreaterThan(expectedPercentage - tolerance);
          expect(percentage).toBeLessThan(expectedPercentage + tolerance);
        }
      });
    });

    describe("when removing winners sequentially", () => {
      it("should handle multiple spins correctly", () => {
        let state: RouletteState = {
          currentGame: 0,
          games: [
            {
              name: "Test Game",
              allUsers: [
                { id: "1", name: "Alice", checked: true, colour: "#FF0000" },
                { id: "2", name: "Bob", checked: true, colour: "#00FF00" },
                { id: "3", name: "Charlie", checked: true, colour: "#0000FF" }
              ],
              remainingUsers: [
                { id: "1", name: "Alice", checked: true, colour: "#FF0000" },
                { id: "2", name: "Bob", checked: true, colour: "#00FF00" },
                { id: "3", name: "Charlie", checked: true, colour: "#0000FF" }
              ],
              spinning: false,
              winningId: null,
              winningName: null,
              seed: 0,
              endImageUrl: ""
            }
          ]
        };

        // First spin - select first user (random = 0.0)
        state = rouletteSlice.reducer(state, prepareSpin({ random: 0.0 }));
        expect(state.games[0].winningId).toBe("1");
        expect(state.games[0].remainingUsers.length).toBe(3);

        // Second spin - should remove first winner and select from remaining
        state = rouletteSlice.reducer(state, prepareSpin({ random: 0.0 }));
        expect(state.games[0].remainingUsers.length).toBe(2);
        expect(state.games[0].winningId).toBe("2"); // Bob is now first

        // Third spin - should remove second winner and select last remaining
        state = rouletteSlice.reducer(state, prepareSpin({ random: 0.0 }));
        expect(state.games[0].remainingUsers.length).toBe(1);
        expect(state.games[0].winningId).toBe("3"); // Charlie is last
      });
    });
  });
});
