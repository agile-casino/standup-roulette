import { describe, expect, it } from "vitest";
import { ascending, descending } from "./orderBy";

describe("ascending", () => {
  describe("when first argument is smaller than second argument", () => {
    it("should return a negative number", () => {
      expect(ascending(1, 2)).toBeLessThan(0);
    });
  });
  describe("when both arguments are equal", () => {
    it("should return 0", () => {
      expect(ascending(1, 1)).toBe(0);
    });
  });
  describe("when first argument is larger than second argument", () => {
    it("should return a positive number", () => {
      expect(ascending(2, 1)).toBeGreaterThan(0);
    });
  });
});

describe("descending", () => {
  describe("when first argument is smaller than second argument", () => {
    it("should return a positive number", () => {
      expect(descending(1, 2)).toBeGreaterThan(0);
    });
  });
  describe("when both arguments are equal", () => {
    it("should return 0", () => {
      expect(descending(1, 1)).toBe(0);
    });
  });
  describe("when first argument is larger than second argument", () => {
    it("should return a negative number", () => {
      expect(descending(2, 1)).toBeLessThan(0);
    });
  });
});
