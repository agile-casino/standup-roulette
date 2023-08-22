import { Action, Reducer } from "@reduxjs/toolkit";
import { getLocalStorage, setLocalStorage } from "../utils/localStorage";

export interface PersistSettings<TState> {
  key: string;
  exclude?: (keyof TState)[];
}

export function persist<TState, TAction extends Action>(reducer: Reducer<TState, TAction>, settings: PersistSettings<TState>): Reducer<TState, TAction> {
  const excludeStateKeys = settings.exclude?.map(x => x.toString());
  return function(state: TState | undefined, action: TAction) {
    if (state === undefined) {
      state = getLocalStorage<TState|undefined>(settings.key, undefined);
    }
    const newState = reducer(state, action);
    setLocalStorage(settings.key, state, excludeStateKeys);
    return newState;
  }
}
