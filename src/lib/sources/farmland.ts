import "server-only";
import { PAI_BBOX, USER_AGENT } from "../config";
import type { FarmlandData } from "../types";

// Public Overpass instances, tried in order. Data is cached in memory for 24 h to stay a polite client.
const ENDPOINTS = ["https://overpass-api.de/api/interpreter", "https://overpass.private.coffee/api/interpreter"];
const TTL_MS = 24 * 60 * 60 * 1000;
const MAX_FEATURES = 4000;

let cache: { at: number; data: FarmlandData } | null = null;

/**
 * Agricultural land-use polygons mapped in OpenStreetMap inside the Pai bounding box.
 * This is crowd-sourced map data, NOT an official plot registry, and it may be incomplete.
 */
export async function fetchFarmland(): Promise<FarmlandData> {
  if (cache && Date.now() - cache.at < TTL_MS) return cache.data;
  const { south, west, north, east } = PAI_BBOX;
  const query = `[out:json][timeout:40];way["landuse"~"^(farmland|orchard|vineyard|farmyard)$"](${south},${west},${north},${east});out geom qt;`;
  let lastError = "Overpass unavailable";
  for (const url of ENDPOINTS) {
    try {
      const res = await fetch(url, {
        method: "POST",
        headers: { "User-Agent": USER_AGENT, "Content-Type": "application/x-www-form-urlencoded" },
        body: new URLSearchParams({ data: query }),
        signal: AbortSignal.timeout(45_000),
        cache: "no-store",
      });
      if (!res.ok) { lastError = `Overpass HTTP ${res.status}`; continue; }
      const j = (await res.json()) as { elements?: { geometry?: { lat: number; lon: number }[]; tags?: Record<string, string> }[] };
      const feats: GeoJSON.Feature[] = [];
      for (const e of j.elements ?? []) {
        const g = e.geometry;
        if (!g || g.length < 4) continue;
        const ring = g.map((p) => [Math.round(p.lon * 1e5) / 1e5, Math.round(p.lat * 1e5) / 1e5]);
        const a = ring[0], b = ring[ring.length - 1];
        if (a[0] !== b[0] || a[1] !== b[1]) continue; // only closed ways are areas
        feats.push({ type: "Feature", properties: { landuse: e.tags?.landuse ?? "", crop: e.tags?.crop ?? "" }, geometry: { type: "Polygon", coordinates: [ring] } });
        if (feats.length >= MAX_FEATURES) break;
      }
      const data: FarmlandData = { geojson: { type: "FeatureCollection", features: feats }, count: feats.length, truncated: feats.length >= MAX_FEATURES };
      cache = { at: Date.now(), data };
      return data;
    } catch (e) {
      lastError = e instanceof Error ? e.message : "Overpass error";
    }
  }
  throw new Error(lastError);
}
