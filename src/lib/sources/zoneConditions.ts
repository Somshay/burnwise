import "server-only";
import { TIMEZONE } from "../config";
import type { ZoneCondition } from "../types";
import { getJson, toIso } from "./openMeteo";

const TTL_MS = 10 * 60 * 1000;
let cache: { at: number; key: string; data: ZoneCondition[] } | null = null;

type Pt = { id: string; lat: number; lon: number };
type Loc<T> = { current?: T };
const asArray = <T,>(j: unknown): T[] => (Array.isArray(j) ? (j as T[]) : [j as T]);

/** Current conditions for many points. Open-Meteo accepts comma-separated coordinates: one request each for weather and air. */
export async function fetchZoneConditions(points: Pt[]): Promise<ZoneCondition[]> {
  const key = points.map((p) => p.id).join(",");
  if (cache && cache.key === key && Date.now() - cache.at < TTL_MS) return cache.data;

  const lat = points.map((p) => p.lat.toFixed(3)).join(",");
  const lon = points.map((p) => p.lon.toFixed(3)).join(",");
  const wq = new URLSearchParams({ latitude: lat, longitude: lon, current: "relative_humidity_2m,pressure_msl,wind_speed_10m,wind_direction_10m", wind_speed_unit: "kmh", timezone: TIMEZONE });
  const aq = new URLSearchParams({ latitude: lat, longitude: lon, current: "pm2_5", timezone: TIMEZONE });
  const [wj, aj] = await Promise.all([
    getJson(`https://api.open-meteo.com/v1/forecast?${wq}`),
    getJson(`https://air-quality-api.open-meteo.com/v1/air-quality?${aq}`),
  ]);
  const w = asArray<Loc<Record<string, number | string>>>(wj);
  const a = asArray<Loc<Record<string, number | string | null>>>(aj);
  if (w.length !== points.length) throw new Error("Open-Meteo returned an unexpected number of locations");

  const data = points.map((p, i) => {
    const c = w[i].current;
    if (!c) throw new Error("Open-Meteo response missing fields");
    const pm = a[i]?.current?.pm2_5;
    return {
      id: p.id,
      time: toIso(String(c.time)),
      windSpeed: Number(c.wind_speed_10m),
      windDirection: Number(c.wind_direction_10m),
      humidity: Number(c.relative_humidity_2m),
      pressureMsl: Number(c.pressure_msl),
      pm25: typeof pm === "number" ? pm : null,
    };
  });
  cache = { at: Date.now(), key, data };
  return data;
}
