import { describe, expect, it } from "vitest";
import { getColourScheme } from "./colourScheme";

describe("getColourScheme", () => {
  it("should return an empty array if numColours is 0", () => {
    expect(getColourScheme(0)).toEqual([]);
  });

  it("should return correct HSL color strings for a given number of colors", () => {
    const result = getColourScheme(3);
    expect(result).toHaveLength(3);
    expect(result[0]).toBe("hsl(0, 75%, 65%)");
    expect(result[1]).toBe("hsl(120, 75%, 65%)");
    expect(result[2]).toBe("hsl(240, 75%, 65%)");
  });

  it("should handle large numbers of colors", () => {
    const result = getColourScheme(360);
    expect(result).toHaveLength(360);
    expect(result[0]).toBe("hsl(0, 75%, 65%)");
    expect(result[180]).toBe("hsl(180, 75%, 65%)");
  });
});
