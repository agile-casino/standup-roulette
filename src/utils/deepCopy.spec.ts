import { describe, expect, it } from "vitest";
import { deepCopy } from "./deepCopy";

describe("deepCopy", () => {
  it("should create a deep copy of an object", () => {
    const original = { a: 1, b: { c: 2 } };
    const copy = deepCopy(original);

    expect(copy).toEqual(original);
    expect(copy).not.toBe(original);
    expect(copy.b).not.toBe(original.b);
  });

  it("should handle arrays", () => {
    const original = [1, 2, { a: 3 }];
    const copy = deepCopy(original);

    expect(copy).toEqual(original);
    expect(copy).not.toBe(original);
    expect(copy[2]).not.toBe(original[2]);
  });

  it("should handle primitive values", () => {
    expect(deepCopy(42)).toBe(42);
    expect(deepCopy("hello")).toBe("hello");
    expect(deepCopy(true)).toBe(true);
    expect(deepCopy(null)).toBe(null);
  });
});
