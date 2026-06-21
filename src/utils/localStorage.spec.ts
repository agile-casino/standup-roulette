import { beforeEach, describe, expect, it } from "vitest";
import { getLocalStorage, setLocalStorage } from "./localStorage";

describe("localStorage utils", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  describe("getLocalStorage", () => {
    it("should return the default value if the key does not exist", () => {
      const result = getLocalStorage("missing-key", { foo: "bar" });
      expect(result).toEqual({ foo: "bar" });
    });

    it("should return the parsed stored value if the key exists", () => {
      localStorage.setItem("existing-key", JSON.stringify({ hello: "world" }));
      const result = getLocalStorage("existing-key", { hello: "default" });
      expect(result).toEqual({ hello: "world" });
    });
  });

  describe("setLocalStorage", () => {
    it("should save the serialized value to localStorage", () => {
      setLocalStorage("my-key", { a: 1, b: 2 });
      const stored = localStorage.getItem("my-key");
      expect(stored).toBe(JSON.stringify({ a: 1, b: 2 }));
    });

    it("should remove the key if the value is undefined", () => {
      localStorage.setItem("my-key", "some-value");
      setLocalStorage("my-key", undefined);
      const stored = localStorage.getItem("my-key");
      expect(stored).toBeNull();
    });

    it("should exclude specific keys from the serialized value if exclude is provided", () => {
      const obj = { a: 1, b: 2, c: 3 };
      setLocalStorage("my-key", obj, ["b"]);
      const stored = localStorage.getItem("my-key");
      expect(stored).toBe(JSON.stringify({ a: 1, c: 3 }));
    });
  });
});
