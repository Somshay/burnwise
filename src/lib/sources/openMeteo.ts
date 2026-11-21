import "server-only";
import { PAI_CENTER, TIMEZONE, USER_AGENT } from "../config";
import type { AirData, WeatherData } from "../types";

// Open-Meteo returns local times without offset when a timezone is requested.
// Asia/Bangkok is a fixed UTC+7 with no DST.
function toIso(local: string): string {
  return /[zZ]|[+-]\d\d:\d\d$/.test(local) ? local : `${local}:00+07:00`;
}

async function getJson(url: string): Promise<Record<string, unknown>> {
  const res = await fetch(url, {
    headers: { "User-Agent": USER_AGENT },
    signal: AbortSignal.timeout(10_000),
    cache: "no-store",
  });
  if (!res.ok) throw new Error(`Open-Meteo HTTP ${res.status}`);
  return (await res.json()) as Record<string, unknown>;
}

export async function fetchWeather(): Promise<WeatherData> {
  const q = new URLSearchParams({
    latitude: String(PAI_CENTER.lat),
    longitude: String(PAI_CENTER.lon),
    current: "temperature_2m,relative_humidity_2m,surface_pressure,wind_speed_10m,wind_direction_10m",
    hourly: "wind_speed_10m,wind_direction_10m",
    wind_speed_unit: "kmh",
    timezone: TIMEZONE,
    forecast_days: "3",
  });
  const j = (await getJson(`https://api.open-meteo.com/v1/forecast?${q}`)) as {
    current?: Record<string, number | string>;
    hourly?: { time: string[]; wind_speed_10m: number[]; wind_direction_10m: number[] };
  };
  const c = j.current;
  const h = j.hourly;
  if (!c || !h) throw new Error("Open-Meteo response missing fields");
  return {
    current: {
      time: toIso(String(c.time)),
      temperature: Number(c.temperature_2m),
      windSpeed: Number(c.wind_speed_10m),
      windDirection: Number(c.wind_direction_10m),
      humidity: Number(c.relative_humidity_2m),
      pressure: Number(c.surface_pressure),
    },
    hourly: h.time.map((t, i) => ({
      time: toIso(t),
      windSpeed: h.wind_speed_10m[i],
      windDirection: h.wind_direction_10m[i],
    })),
  };
}

export async function fetchAir(): Promise<AirData> {
  const q = new URLSearchParams({
    latitude: String(PAI_CENTER.lat),
    longitude: String(PAI_CENTER.lon),
    current: "pm2_5",
    timezone: TIMEZONE,
  });
  const j = (await getJson(`https://air-quality-api.open-meteo.com/v1/air-quality?${q}`)) as {
    current?: { time: string; pm2_5: number | null };
  };
  if (!j.current) throw new Error("Open-Meteo air response missing fields");
  return { time: toIso(j.current.time), pm25: j.current.pm2_5 ?? null };
}
