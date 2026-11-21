"use client";
import { useCallback, useSyncExternalStore } from "react";

export type ThemePref = "light" | "dark" | "system";
const KEY = "burnwise-theme";
const EVENT = "burnwise:theme";

function readPref(): ThemePref {
  try {
    const v = localStorage.getItem(KEY);
    return v === "light" || v === "dark" ? v : "system";
  } catch { return "system"; }
}

export function applyTheme(pref: ThemePref) {
  const dark = pref === "dark" || (pref === "system" && matchMedia("(prefers-color-scheme: dark)").matches);
  document.documentElement.dataset.theme = dark ? "dark" : "light";
}

export function useTheme() {
  const pref = useSyncExternalStore(
    (cb) => { window.addEventListener(EVENT, cb); return () => window.removeEventListener(EVENT, cb); },
    readPref,
    () => "system" as ThemePref,
  );
  const setPref = useCallback((p: ThemePref) => {
    try { if (p === "system") localStorage.removeItem(KEY); else localStorage.setItem(KEY, p); } catch { /* ignore */ }
    applyTheme(p);
    window.dispatchEvent(new Event(EVENT));
  }, []);
  return [pref, setPref] as const;
}
