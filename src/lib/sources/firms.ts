import "server-only";
import { PAI_BBOX, USER_AGENT } from "../config";
import type { Hotspot } from "../types";

export function firmsConfigured(): boolean {
  return Boolean(process.env.FIRMS_MAP_KEY);
}

/** NASA FIRMS VIIRS S-NPP near-real-time detections in the Pai bounding box (day_range=1). */
export async function fetchHotspots(): Promise<Hotspot[]> {
  const key = process.env.FIRMS_MAP_KEY;
  if (!key) throw new Error("FIRMS_MAP_KEY not set");
  const area = `${PAI_BBOX.west},${PAI_BBOX.south},${PAI_BBOX.east},${PAI_BBOX.north}`;
  const url = `https://firms.modaps.eosdis.nasa.gov/api/area/csv/${encodeURIComponent(key)}/VIIRS_SNPP_NRT/${area}/1`;
  const res = await fetch(url, { headers: { "User-Agent": USER_AGENT }, signal: AbortSignal.timeout(15_000), cache: "no-store" });
  // Never include the URL (it contains the key) in thrown errors.
  if (!res.ok) throw new Error(`FIRMS HTTP ${res.status}`);
  const text = (await res.text()).trim();
  const lines = text.split(/\r?\n/);
  if (lines.length === 0 || !lines[0].includes("latitude")) throw new Error("FIRMS returned an unexpected response");
  const head = lines[0].split(",");
  const idx = (n: string) => head.indexOf(n);
  const iLat = idx("latitude"), iLon = idx("longitude"), iDate = idx("acq_date"), iTime = idx("acq_time"), iConf = idx("confidence"), iSat = idx("satellite");
  return lines.slice(1).filter(Boolean).map((l) => {
    const f = l.split(",");
    const t = (f[iTime] ?? "0000").padStart(4, "0");
    return {
      lat: Number(f[iLat]),
      lon: Number(f[iLon]),
      acquiredAt: `${f[iDate]}T${t.slice(0, 2)}:${t.slice(2)}:00Z`,
      confidence: f[iConf] ?? "",
      satellite: f[iSat] ?? "VIIRS",
    };
  }).filter((h) => Number.isFinite(h.lat) && Number.isFinite(h.lon));
}
