import { Action, Reducer } from "@reduxjs/toolkit";
import { persist } from "../../src/store/persist";

interface TestState {
    hello: string;
}

type TestReducer = Reducer<TestState, Action<string>>;

describe("persist", () => {
  describe("when state is undefined", () => {
    it("loads state", () => {
      const reducer: TestReducer = jest.fn().mockImplementation((x: TestState) => x);
      jest.spyOn(window.localStorage, "getItem").mockReturnValue('{ "version": "1", "state": { "hello": "world" } }');
      const persisted = persist(reducer, { key: "test", version: 1 });

      const result = persisted(undefined, { type: "" });

      expect(result.hello).toEqual("world");
    });
  });

  describe("when state is not undefined", () => {
    xit("does not load state", () => {
      const reducer: TestReducer = jest.fn().mockImplementation((x: TestState) => x);
      const localStorageSpy = jest.spyOn(window.localStorage, "getItem");
      const persisted = persist(reducer, { key: "test", version: 1 });

      persisted({ hello: "world" }, { type: "" });

      console.log(localStorageSpy.mock.calls);
      expect(localStorageSpy).not.toHaveBeenCalled();
    });
  });
});