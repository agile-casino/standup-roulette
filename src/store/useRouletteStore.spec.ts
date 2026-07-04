import { beforeEach, describe, expect, it } from "vitest";
import { useRouletteStore } from "./useRouletteStore";

describe("useRouletteStore", () => {
  beforeEach(() => {
    useRouletteStore.setState({
      currentGame: 0,
      games: [
        {
          name: "Test Game",
          allUsers: [],
          remainingUsers: [],
          spinning: false,
          winningId: null,
          winningName: null,
          seed: 0,
          endImageUrls: []
        }
      ],
      timerType: "off",
      timerDuration: 60,
      timerLimit: 60,
      wheelType: "old"
    });
  });

  describe("prepareSpin", () => {
    describe("when selecting a winner with random values", () => {
      it("should handle random = 0.0 correctly", () => {
        useRouletteStore.setState({
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
              endImageUrls: []
            }
          ]
        });

        useRouletteStore.getState().prepareSpin(0.0);
        expect(useRouletteStore.getState().games[0].winningId).toBe("1");
      });

      it("should handle random = 0.5 correctly", () => {
        useRouletteStore.setState({
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
              endImageUrls: []
            }
          ]
        });

        useRouletteStore.getState().prepareSpin(0.5);
        expect(useRouletteStore.getState().games[0].winningId).toBe("3");
      });

      it("should handle random = 0.99999 correctly", () => {
        useRouletteStore.setState({
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
              endImageUrls: []
            }
          ]
        });

        useRouletteStore.getState().prepareSpin(0.99999);
        expect(useRouletteStore.getState().games[0].winningId).toBe("3");
      });

      it("should handle random = 1.0 correctly without going out of bounds", () => {
        useRouletteStore.setState({
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
              endImageUrls: []
            }
          ]
        });

        useRouletteStore.getState().prepareSpin(1.0);
        expect(useRouletteStore.getState().games[0].winningId).toBe("3");
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

        const iterations = 1000;

        for (let i = 0; i < iterations; i++) {
          useRouletteStore.setState({
            games: [
              {
                name: "Test Game",
                allUsers: users,
                remainingUsers: [...users],
                spinning: false,
                winningId: null,
                winningName: null,
                seed: 0,
                endImageUrls: []
              }
            ]
          });

          const random = Math.random();
          useRouletteStore.getState().prepareSpin(random);
          const winningId = useRouletteStore.getState().games[0].winningId;

          if (winningId) {
            selectionCounts[winningId]++;
          }
        }

        const expectedPercentage = 25;
        const tolerance = 6;

        for (const id of userIds) {
          const percentage = (selectionCounts[id] / iterations) * 100;
          expect(percentage).toBeGreaterThan(expectedPercentage - tolerance);
          expect(percentage).toBeLessThan(expectedPercentage + tolerance);
        }
      });
    });

    describe("when removing winners sequentially", () => {
      it("should handle multiple spins correctly", () => {
        useRouletteStore.setState({
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
              endImageUrls: []
            }
          ]
        });

        const store = useRouletteStore.getState();

        store.prepareSpin(0.0);
        expect(useRouletteStore.getState().games[0].winningId).toBe("1");
        expect(useRouletteStore.getState().games[0].remainingUsers.length).toBe(3);

        store.prepareSpin(0.0);
        expect(useRouletteStore.getState().games[0].remainingUsers.length).toBe(2);
        expect(useRouletteStore.getState().games[0].winningId).toBe("2");

        store.prepareSpin(0.0);
        expect(useRouletteStore.getState().games[0].remainingUsers.length).toBe(1);
        expect(useRouletteStore.getState().games[0].winningId).toBe("3");
      });
    });
  });

  describe("timer actions", () => {
    it("should handle setTimerType correctly", () => {
      useRouletteStore.getState().setTimerType("up");
      expect(useRouletteStore.getState().timerType).toBe("up");
    });

    it("should handle setTimerDuration correctly", () => {
      useRouletteStore.getState().setTimerDuration(120);
      expect(useRouletteStore.getState().timerDuration).toBe(120);
    });

    it("should handle setTimerLimit correctly", () => {
      useRouletteStore.getState().setTimerLimit(180);
      expect(useRouletteStore.getState().timerLimit).toBe(180);
    });
  });

  describe("wheel actions", () => {
    it("should handle setWheelType correctly", () => {
      useRouletteStore.getState().setWheelType("new");
      expect(useRouletteStore.getState().wheelType).toBe("new");
    });
  });

  describe("migrations", () => {
    it("should migrate version 5 state to version 7", () => {
      const migrate = useRouletteStore.persist.getOptions().migrate;
      if (migrate) {
        const legacyState = {
          currentGame: 0,
          games: []
        };
        const migrated = migrate(legacyState, 5);
        expect(migrated).toEqual({
          currentGame: 0,
          games: [],
          timerType: "off",
          timerDuration: 60,
          timerLimit: 60,
          wheelType: "old"
        });
      }
    });

    it("should migrate version 6 state to version 7", () => {
      const migrate = useRouletteStore.persist.getOptions().migrate;
      if (migrate) {
        const legacyState = {
          currentGame: 0,
          games: [],
          timerType: "off",
          timerDuration: 60,
          timerLimit: 60
        };
        const migrated = migrate(legacyState, 6);
        expect(migrated).toEqual({
          currentGame: 0,
          games: [],
          timerType: "off",
          timerDuration: 60,
          timerLimit: 60,
          wheelType: "old"
        });
      }
    });
  });
});
