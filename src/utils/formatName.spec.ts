import { describe, expect, it } from "vitest";
import { formatName } from "./formatName";

describe("formatName", () => {
  it("should return an empty string when name is null", () => {
    const result = formatName(null);
    expect(result).toBe("");
  });

  it("should return an empty string when name is an empty string", () => {
    const result = formatName("");
    expect(result).toBe("");
  });

  it("should return the name without extra characters after a space", () => {
    const result = formatName("John Doe <extra>");
    expect(result).toBe("John Doe");
  });

  it("should reverse the name when it contains a comma", () => {
    const result = formatName("Doe, John");
    expect(result).toBe("John Doe");
  });

  it("should not reverse the name when it does not contain a comma", () => {
    const result = formatName("John Doe");
    expect(result).toBe("John Doe");
  });

  it("should handle names with multiple words correctly", () => {
    const result = formatName("Smith, John Michael");
    expect(result).toBe("John Michael Smith");
  });

  it("should handle names with multiple spaces correctly", () => {
    const result = formatName("John   Doe");
    expect(result).toBe("John   Doe");
  });
});

