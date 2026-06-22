import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { selectPerson, selectTeam } from "./adosHelper";

// Mock delay to avoid waiting 1 second in tests
vi.mock("./delay", () => ({
  delay: vi.fn().mockResolvedValue(undefined)
}));

// Mock waitForElement to execute callbacks synchronously and instantly
vi.mock("./waitForElement", () => {
  return {
    waitFor: vi.fn(async action => {
      const res = action();
      if (!res) {
        throw new Error("Mock timeout");
      }
      return res;
    }),
    waitForElement: vi.fn(async (parent, selector) => {
      const res = parent.querySelector(selector);
      if (!res) {
        throw new Error("Mock element not found");
      }
      return res;
    })
  };
});

describe("adosHelper", () => {
  beforeEach(() => {
    document.body.innerHTML = "";
  });

  afterEach(() => {
    document.body.innerHTML = "";
    vi.clearAllMocks();
  });

  describe("selectTeam", () => {
    it("should return true immediately if the correct team is already selected", async () => {
      const dropdown = document.createElement("div");
      dropdown.className = "directory-selector-dropdown";
      dropdown.textContent = "Alpha";
      document.body.appendChild(dropdown);

      const result = await selectTeam("Alpha");
      expect(result).toBe(true);
    });

    it("should click the button and select the team from list if team is not currently selected", async () => {
      const dropdown = document.createElement("div");
      dropdown.className = "directory-selector-dropdown";
      dropdown.textContent = "Beta";

      const button = document.createElement("button");
      button.className = "bolt-button";
      dropdown.appendChild(button);
      document.body.appendChild(dropdown);

      const buttonClickSpy = vi.spyOn(button, "click");

      const teamRow = document.createElement("div");
      teamRow.className = "directory-dropdown-link";
      teamRow.textContent = "Alpha";
      document.body.appendChild(teamRow);
      const rowClickSpy = vi.spyOn(teamRow, "click");

      const result = await selectTeam("Alpha");

      expect(buttonClickSpy).toHaveBeenCalled();
      expect(rowClickSpy).toHaveBeenCalled();
      expect(result).toBe(true);
    });

    it("should try fallback matching with 'team <name>' prefix", async () => {
      const dropdown = document.createElement("div");
      dropdown.className = "directory-selector-dropdown";
      dropdown.textContent = "Beta";
      const button = document.createElement("button");
      button.className = "bolt-button";
      dropdown.appendChild(button);
      document.body.appendChild(dropdown);

      const teamRow = document.createElement("div");
      teamRow.className = "directory-dropdown-link";
      teamRow.textContent = "Team Alpha";
      document.body.appendChild(teamRow);
      const rowClickSpy = vi.spyOn(teamRow, "click");

      const result = await selectTeam("Alpha");

      expect(rowClickSpy).toHaveBeenCalled();
      expect(result).toBe(true);
    });

    it("should return false if team elements are not found", async () => {
      const result = await selectTeam("Alpha");
      expect(result).toBe(false);
    });
  });

  describe("selectPerson", () => {
    it("should select the matching person option", async () => {
      const dropdown = document.createElement("div");
      dropdown.textContent = "Person: John";
      document.body.appendChild(dropdown);

      const dropdownClickSpy = vi.spyOn(dropdown, "click");

      const personRow1 = document.createElement("div");
      personRow1.className = "bolt-list-row";
      personRow1.textContent = "@Me";

      const personRow2 = document.createElement("div");
      personRow2.className = "bolt-list-row";
      personRow2.textContent = "Alice Smith";

      const personRow3 = document.createElement("div");
      personRow3.className = "bolt-list-row";
      personRow3.textContent = "Bob Jones";

      document.body.appendChild(personRow1);
      document.body.appendChild(personRow2);
      document.body.appendChild(personRow3);

      const rowClickSpy = vi.spyOn(personRow3, "click");

      const originalEvaluate = document.evaluate;
      document.evaluate = vi.fn().mockReturnValue({
        iterateNext: () => dropdown
      });

      try {
        await selectPerson("Bob");

        expect(dropdownClickSpy).toHaveBeenCalled();
        expect(rowClickSpy).toHaveBeenCalled();
      } finally {
        document.evaluate = originalEvaluate;
      }
    });

    it("should select the 'All' option if no matching person is found", async () => {
      const dropdown = document.createElement("div");
      dropdown.textContent = "Person: John";
      document.body.appendChild(dropdown);

      const allRow = document.createElement("div");
      allRow.className = "bolt-list-row";
      allRow.textContent = "All";

      const personRow = document.createElement("div");
      personRow.className = "bolt-list-row";
      personRow.textContent = "Alice Smith";

      document.body.appendChild(allRow);
      document.body.appendChild(personRow);

      const allClickSpy = vi.spyOn(allRow, "click");

      const originalEvaluate = document.evaluate;
      document.evaluate = vi.fn().mockReturnValue({
        iterateNext: () => dropdown
      });

      try {
        await selectPerson("Charlie");
        expect(allClickSpy).toHaveBeenCalled();
      } finally {
        document.evaluate = originalEvaluate;
      }
    });

    it("should return false on exception/timeout", async () => {
      const originalEvaluate = document.evaluate;
      document.evaluate = vi.fn().mockImplementation(() => {
        throw new Error("Evaluation failed");
      });

      try {
        const result = await selectPerson("Bob");
        expect(result).toBe(false);
      } finally {
        document.evaluate = originalEvaluate;
      }
    });
  });
});
