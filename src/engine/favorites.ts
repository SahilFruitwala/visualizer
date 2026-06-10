import { useSyncExternalStore } from "react";

const FAVORITES_KEY = "devviz:favorites";
const CHANGE_EVENT = "devviz:favorites-change";

const EMPTY: string[] = [];

/** Stable snapshot reference — only replaced when favorites actually change. */
let snapshot: string[] = EMPTY;

function parseFavorites(raw: string | null): string[] {
  if (!raw) return EMPTY;
  try {
    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) return EMPTY;
    const ids = parsed.filter((id): id is string => typeof id === "string");
    return ids.length === 0 ? EMPTY : ids;
  } catch {
    return EMPTY;
  }
}

function loadFromStorage(): string[] {
  if (typeof localStorage === "undefined") return EMPTY;
  const next = parseFavorites(localStorage.getItem(FAVORITES_KEY));
  snapshot = next;
  return snapshot;
}

function arraysEqual(a: string[], b: string[]): boolean {
  if (a === b) return true;
  if (a.length !== b.length) return false;
  for (let i = 0; i < a.length; i++) {
    if (a[i] !== b[i]) return false;
  }
  return true;
}

function commitSnapshot(next: string[]) {
  const normalized = next.length === 0 ? EMPTY : [...next];
  if (arraysEqual(snapshot, normalized)) return;
  snapshot = normalized;
  if (typeof localStorage !== "undefined") {
    localStorage.setItem(FAVORITES_KEY, JSON.stringify(normalized));
  }
  window.dispatchEvent(new CustomEvent(CHANGE_EVENT));
}

// Hydrate once on module load (client only).
if (typeof window !== "undefined") {
  loadFromStorage();
}

function getSnapshot(): string[] {
  return snapshot;
}

function getServerSnapshot(): string[] {
  return EMPTY;
}

export function subscribeFavorites(onStoreChange: () => void) {
  const onStorage = (e: StorageEvent) => {
    if (e.key !== FAVORITES_KEY) return;
    const next = parseFavorites(e.newValue);
    if (arraysEqual(snapshot, next)) return;
    snapshot = next;
    onStoreChange();
  };
  window.addEventListener(CHANGE_EVENT, onStoreChange);
  window.addEventListener("storage", onStorage);
  return () => {
    window.removeEventListener(CHANGE_EVENT, onStoreChange);
    window.removeEventListener("storage", onStorage);
  };
}

export function toggleFavorite(topicId: string): boolean {
  const favs = snapshot === EMPTY ? [] : [...snapshot];
  const i = favs.indexOf(topicId);
  if (i >= 0) {
    favs.splice(i, 1);
    commitSnapshot(favs);
    return false;
  }
  favs.push(topicId);
  commitSnapshot(favs);
  return true;
}

export function isFavorite(topicId: string): boolean {
  return snapshot.includes(topicId);
}

export function getFavorites(): string[] {
  return snapshot;
}

export function useFavorites(): string[] {
  return useSyncExternalStore(subscribeFavorites, getSnapshot, getServerSnapshot);
}
