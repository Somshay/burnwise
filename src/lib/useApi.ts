"use client";
import { useCallback, useEffect, useState, useSyncExternalStore } from "react";
import type { ApiResult } from "./types";

type State<T> = { loading: boolean; result?: ApiResult<T>; networkError?: boolean };

export function useApi<T>(url: string) {
  const [state, setState] = useState<State<T>>({ loading: true });
  const [tick, setTick] = useState(0);

  useEffect(() => {
    const ctrl = new AbortController();
    fetch(url, { signal: ctrl.signal, cache: "no-store" })
      .then((r) => r.json() as Promise<ApiResult<T>>)
      .then((result) => setState({ loading: false, result }))
      .catch((e) => {
        if (e?.name !== "AbortError") setState({ loading: false, networkError: true });
      });
    return () => ctrl.abort();
  }, [url, tick]);

  const refresh = useCallback(() => {
    setState((s) => ({ ...s, loading: true }));
    setTick((t) => t + 1);
  }, []);

  return { ...state, refresh };
}

/** Current time bucketed to `intervalMs`; 0 during SSR/hydration (treat as unknown). */
export function useNow(intervalMs = 60_000): number {
  return useSyncExternalStore(
    (cb) => {
      const id = setInterval(cb, intervalMs);
      return () => clearInterval(id);
    },
    () => Math.floor(Date.now() / intervalMs) * intervalMs,
    () => 0,
  );
}

export function isStale(iso: string | undefined, now: number, maxAgeMs: number): boolean {
  if (!iso || !now) return false;
  const t = new Date(iso).getTime();
  return Number.isFinite(t) && now - t > maxAgeMs;
}
