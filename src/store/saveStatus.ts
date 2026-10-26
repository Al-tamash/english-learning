import { useSyncExternalStore } from 'react';

export type SaveState = 'saved' | 'error';

export interface SaveSnapshot {
  state: SaveState;
  savedAt: string | null;
}

function storageAvailable(): boolean {
  if (typeof localStorage === 'undefined') {
    return false;
  }
  try {
    const key = '__bol_storage_test__';
    localStorage.setItem(key, '1');
    localStorage.removeItem(key);
    return true;
  } catch {
    return false;
  }
}

let snapshot: SaveSnapshot = {
  state: storageAvailable() ? 'saved' : 'error',
  savedAt: null,
};

const listeners = new Set<() => void>();

export function reportSave(state: SaveState, now = new Date()): void {
  snapshot = {
    state,
    savedAt: state === 'saved' ? now.toISOString() : snapshot.savedAt,
  };
  listeners.forEach((listener) => listener());
}

export function getSaveSnapshot(): SaveSnapshot {
  return snapshot;
}

export function subscribeToSave(listener: () => void): () => void {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export function useSaveStatus(): SaveSnapshot {
  return useSyncExternalStore(subscribeToSave, getSaveSnapshot, getSaveSnapshot);
}
