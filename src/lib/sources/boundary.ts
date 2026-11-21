import "server-only";
import { USER_AGENT } from "../config";
import type { BoundaryData } from "../types";

/** Pai District boundary from OpenStreetMap via Nominatim (cached for one day). */
export async function fetchBoundary(): Promise<BoundaryData> {
  const q = new URLSearchParams({
    q: "Pai District, Mae Hong Son",
    format: "jsonv2",
    polygon_geojson: "1",
    limit: "5",
    countrycodes: "th",
  });
  const res = await fetch(`https://nominatim.openstreetmap.org/search?${q}`, {
    headers: { "User-Agent": USER_AGENT, "Accept-Language": "th" },
    signal: AbortSignal.timeout(15_000),
    next: { revalidate: 86400 },
  });
  if (!res.ok) throw new Error(`Nominatim HTTP ${res.status}`);
  const rows = (await res.json()) as { geojson?: GeoJSON.GeoJsonObject & { type: string }; display_name?: string; category?: string; type?: string }[];
  const hit = rows.find((r) => r.geojson && (r.geojson.type === "Polygon" || r.geojson.type === "MultiPolygon") && /ปาย|Pai/.test(r.display_name ?? ""));
  if (!hit?.geojson) throw new Error("Boundary not found");
  return { geojson: hit.geojson, name: hit.display_name ?? "อำเภอปาย" };
}
