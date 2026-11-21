import "server-only";
import { NextResponse } from "next/server";
import { PAI_BBOX, PAI_CENTER } from "./config";
import type { ApiResult, SourceInfo } from "./types";

export function respond<T>(source: SourceInfo, body: Omit<ApiResult<T>, "source" | "fetchedAt">) {
  const result: ApiResult<T> = { ...body, source, fetchedAt: new Date().toISOString() };
  return NextResponse.json(result, { headers: { "Cache-Control": "no-store" } });
}

export function errMessage(e: unknown): string {
  // Messages come from our own adapters and never contain keys or URLs.
  return e instanceof Error ? e.message : "unknown error";
}


/** Optional ?lat=&lon= query, accepted only inside the Pai bounding box (else the district centre). Rounded for cache friendliness. */
export function pointFromUrl(url: string): { lat: number; lon: number } {
  const sp = new URL(url).searchParams;
  const lat = Number(sp.get("lat")), lon = Number(sp.get("lon"));
  const ok = sp.has("lat") && sp.has("lon") && Number.isFinite(lat) && Number.isFinite(lon)
    && lat >= PAI_BBOX.south && lat <= PAI_BBOX.north && lon >= PAI_BBOX.west && lon <= PAI_BBOX.east;
  return ok ? { lat: Math.round(lat * 1000) / 1000, lon: Math.round(lon * 1000) / 1000 } : { ...PAI_CENTER };
}
