import "server-only";
import { NextResponse } from "next/server";
import type { ApiResult, SourceInfo } from "./types";

export function respond<T>(source: SourceInfo, body: Omit<ApiResult<T>, "source" | "fetchedAt">) {
  const result: ApiResult<T> = { ...body, source, fetchedAt: new Date().toISOString() };
  return NextResponse.json(result, { headers: { "Cache-Control": "no-store" } });
}

export function errMessage(e: unknown): string {
  // Messages come from our own adapters and never contain keys or URLs.
  return e instanceof Error ? e.message : "unknown error";
}
