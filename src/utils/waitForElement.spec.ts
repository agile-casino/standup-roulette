import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { waitFor, waitForElement } from "./waitForElement";

describe("waitForElement utils", () => {
  describe("waitFor", () => {
    it("should resolve when action returns a truthy value", async () => {
      let value: string | null = null;
      
      // Change value to "hello" after 150ms (interval is 100ms, so it checks around 200ms)
      setTimeout(() => {
        value = "hello";
      }, 150);

      const result = await waitFor(() => value, 1000);
      expect(result).toBe("hello");
    });

    it("should reject with timeout error if action remains falsy", async () => {
      const promise = waitFor(() => null, 50);
      await expect(promise).rejects.toThrow("Timed out.");
    });
  });

  describe("waitForElement", () => {
    let parent: HTMLDivElement;

    beforeEach(() => {
      parent = document.createElement("div");
      document.body.appendChild(parent);
    });

    afterEach(() => {
      if (parent.parentNode) {
        parent.parentNode.removeChild(parent);
      }
    });

    it("should resolve when element matching selector is added to parent", async () => {
      const child = document.createElement("div");
      child.className = "child-element";

      // Append element after 150ms
      setTimeout(() => {
        parent.appendChild(child);
      }, 150);

      const result = await waitForElement(parent, ".child-element", 1000);
      expect(result).toBe(child);
    });

    it("should reject with timeout error if element is not found", async () => {
      const promise = waitForElement(parent, ".non-existent", 50);
      await expect(promise).rejects.toThrow("Could not find element for selector .non-existent in 50 milliseconds.");
    });
  });
});
