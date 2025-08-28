import type { Action, Reducer } from "@reduxjs/toolkit";
import { getLocalStorage, setLocalStorage } from "../utils/localStorage";

interface Persisted {
  version: number;
  state: unknown;
}

interface PersistSettings<TState> {
  key: string;
  version: number;
  migrations?: MigrationSet<TState>;
}

// biome-ignore lint/suspicious/noExplicitAny: can't think of a better way at the moment
type Migration<TState> = (oldState: any) => TState;
type MigrationSet<TState> = Record<number, Migration<TState> | undefined>;

export function persist<TState, TAction extends Action>(reducer: Reducer<TState, TAction>, settings: PersistSettings<TState>): Reducer<TState, TAction> {
  return (state: TState | undefined, action: TAction) => {
    const currentState = state ?? load(settings.key, settings.migrations ?? {});
    const newState = reducer(currentState, action);
    save(settings.key, newState, settings.version);
    return newState;
  };
}

function save<TState>(key: string, state: TState, version: number) {
  setLocalStorage(key, { state, version });
}

function load<TState>(key: string, migrations: MigrationSet<TState>): TState | undefined {
  const loaded = getLocalStorage<Persisted | undefined>(key, undefined);
  return loaded ? migrate(loaded, migrations) : undefined;
}

function migrate<TState>(loaded: Persisted, migrations: MigrationSet<TState>): TState {
  const migration = migrations[loaded.version];
  if (migration) {
    return migration(loaded.version ? loaded.state : loaded);
  }
  return loaded.state as TState;
}
