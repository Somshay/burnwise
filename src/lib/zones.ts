import data from "@/data/burn-zones.json";

/** Downwind bearings (clockwise from `fromDeg` to `toDeg`) toward something smoke should avoid, defined by the project team. */
export type AvoidSector = { fromDeg: number; toDeg: number; label: string };
export type BurnZone = { id: string; name: string; lat: number; lon: number; rai: number; material: string; avoid?: AvoidSector };

export const ZONES_ARE_SAMPLE: boolean = data.sample;
export const ZONES_NOTE: string = data.note;
export const ZONES: BurnZone[] = data.zones;

export function haversineKm(a: { lat: number; lon: number }, b: { lat: number; lon: number }): number {
  const R = 6371, rad = Math.PI / 180;
  const dLat = (b.lat - a.lat) * rad, dLon = (b.lon - a.lon) * rad;
  const h = Math.sin(dLat / 2) ** 2 + Math.cos(a.lat * rad) * Math.cos(b.lat * rad) * Math.sin(dLon / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(h));
}

export function nearestZone(p: { lat: number; lon: number }): { zone: BurnZone; km: number } | null {
  let best: { zone: BurnZone; km: number } | null = null;
  for (const z of ZONES) {
    const km = haversineKm(p, z);
    if (!best || km < best.km) best = { zone: z, km };
  }
  return best;
}
