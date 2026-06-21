import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { isInDocument } from "./isInDocument";

describe("isInDocument", () => {
  let container: HTMLDivElement;

  beforeEach(() => {
    container = document.createElement("div");
  });

  afterEach(() => {
    if (container.parentNode) {
      container.parentNode.removeChild(container);
    }
  });

  it("should return true if the element is appended to document.body", () => {
    document.body.appendChild(container);
    expect(isInDocument(container)).toBe(true);
  });

  it("should return true if a child of the appended element is checked", () => {
    const child = document.createElement("span");
    container.appendChild(child);
    document.body.appendChild(container);
    expect(isInDocument(child)).toBe(true);
  });

  it("should return undefined (falsy) if the element is detached", () => {
    expect(isInDocument(container)).toBeUndefined();
  });

  it("should return undefined (falsy) if a child of a detached element is checked", () => {
    const child = document.createElement("span");
    container.appendChild(child);
    expect(isInDocument(child)).toBeUndefined();
  });
});
