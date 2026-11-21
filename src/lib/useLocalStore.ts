"use client";
import { useCallback, useMemo, useSyncExternalStore } from "react";

const EVENT = "burnwise:storage";

function read(key: string): string | null {
  try { return localStorage.getItem(key); } catch { return null; }
}

/** Persists JSON in localStorage (browser only, never sent anywhere). */
export function useLocalStore<T extends object>(key: string, initial: T) {
  const raw = useSyncExternalStore(
    (cb) => {
      window.addEventListener(EVENT, cb);
      window.addEventListener("storage", cb);
      return () => { window.removeEventListener(EVENT, cb); window.removeEventListener("storage", cb); };
    },
    () => read(key),
    () => null,
  );
  const value = useMemo<T>(() => {
    if (!raw) return initial;
    try { return { ...initial, ...(JSON.parse(raw) as T) }; } catch { return initial; }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [raw]);
  const set = useCallback((next: T) => {
    try { localStorage.setItem(key, JSON.stringify(next)); } catch { /* storage unavailable */ }
    window.dispatchEvent(new Event(EVENT));
  }, [key]);
  return [value, set] as const;
}
