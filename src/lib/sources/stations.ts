import "server-only";
import { USER_AGENT } from "../config";
import type { Station } from "../types";

export function stationsConfigured(): boolean {
  return Boolean(process.env.STATION_API_URL);
}

/**
 * Adapter for a real monitoring-station API. Expected JSON shape (adapt here for the real provider):
 * { "stations": [ { "id", "name", "lat", "lon", "observedAt" (ISO), "pm25"?, "temperature"?, "humidity"? } ] }
 */
export async function fetchStations(): Promise<Station[]> {
  const url = process.env.STATION_API_URL;
  if (!url) throw new Error("STATION_API_URL not set");
  const headers: Record<string, string> = { "User-Agent": USER_AGENT };
  if (process.env.STATION_API_TOKEN) headers.Authorization = `Bearer ${process.env.STATION_API_TOKEN}`;
  const res = await fetch(url, { headers, signal: AbortSignal.timeout(10_000), cache: "no-store" });
  if (!res.ok) throw new Error(`Station API HTTP ${res.status}`);
  const j = (await res.json()) as { stations?: Station[] };
  if (!Array.isArray(j.stations)) throw new Error("Station API returned an unexpected shape");
  return j.stations.filter((s) => s && typeof s.lat === "number" && typeof s.lon === "number" && s.observedAt);
}
