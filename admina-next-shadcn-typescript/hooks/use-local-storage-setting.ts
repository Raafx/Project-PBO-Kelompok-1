"use client";

import { useCallback, useSyncExternalStore } from "react";

const CHANGE_EVENT = "admina:setting-change";

function subscribe(callback: () => void) {
  window.addEventListener("storage", callback);
  window.addEventListener(CHANGE_EVENT, callback);
  return () => {
    window.removeEventListener("storage", callback);
    window.removeEventListener(CHANGE_EVENT, callback);
  };
}

function read(key: string, fallback: string) {
  try {
    return localStorage.getItem(key) ?? fallback;
  } catch {
    // Storage can be unavailable (e.g. privacy mode) — fall back to the default.
    return fallback;
  }
}

/**
 * A string setting persisted in localStorage. Every component using the same key
 * stays in sync (also across tabs). Renders `fallback` on the server.
 */
export function useLocalStorageSetting(key: string, fallback: string) {
  const value = useSyncExternalStore(
    subscribe,
    () => read(key, fallback),
    () => fallback
  );

  const setValue = useCallback(
    (next: string) => {
      try {
        localStorage.setItem(key, next);
      } catch {
        // Ignore — the setting simply won't persist.
      }
      window.dispatchEvent(new Event(CHANGE_EVENT));
    },
    [key]
  );

  return [value, setValue] as const;
}
