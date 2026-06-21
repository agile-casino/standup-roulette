import { describe, expect, it } from "vitest";
import { getMascot } from "./mascot";

describe("getMascot", () => {
  it("should return a number", () => {
    const result = getMascot("Pikachu", 0.5);
    expect(typeof result).toBe("number");
  });

  it("should return a number within the range of available pokemon images [0, 1024]", () => {
    for (let i = 0; i < 100; i++) {
      const seed = Math.random();
      const result = getMascot(`Name_${i}`, seed);
      expect(result).toBeGreaterThanOrEqual(0);
      expect(result).toBeLessThan(1025);
      expect(Number.isInteger(result)).toBe(true);
    }
  });

  it("should consistently return the same value for the same name and seed", () => {
    const result1 = getMascot("Eevee", 0.12345);
    const result2 = getMascot("Eevee", 0.12345);
    expect(result1).toBe(result2);
  });

  it("should return different values for different seeds or names", () => {
    const result1 = getMascot("Eevee", 0.12345);
    const result2 = getMascot("Eevee", 0.54321);
    const result3 = getMascot("Charmander", 0.12345);

    expect(result1).not.toBe(result2);
    expect(result1).not.toBe(result3);
  });
});
