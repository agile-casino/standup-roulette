// @vitest-environment happy-dom

import { Action, Reducer } from "@reduxjs/toolkit";
import { describe, expect, it, vi } from "vitest";
import { persist } from "./persist";

interface TestState {
  hello: string;
}

type TestReducer = Reducer<TestState, Action>;

describe("persist", () => {
  describe("when state is undefined", () => {
    it("loads state", () => {
      const reducer: TestReducer = vi.fn().mockImplementation((x: TestState) => x);
      vi.spyOn(window.localStorage, "getItem").mockReturnValue('{ "version": "1", "state": { "hello": "world" } }');
      const persisted = persist(reducer, { key: "test", version: 1 });

      const result = persisted(undefined, { type: "" });

      expect(result.hello).toEqual("world");
    });
  });

  describe("when state is not undefined", () => {
    it("does not load state", () => {
      const reducer: TestReducer = vi.fn().mockImplementation((x: TestState) => x);
      const localStorageSpy = vi.spyOn(window.localStorage, "getItem");
      const persisted = persist(reducer, { key: "test", version: 1 });

      persisted({ hello: "world" }, { type: "" });

      expect(localStorageSpy).not.toHaveBeenCalled();
    });
  });
});
