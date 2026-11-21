import { respond, errMessage } from "@/lib/apiHelpers";
import { fetchZoneConditions } from "@/lib/sources/zoneConditions";
import type { SourceInfo, ZoneCondition } from "@/lib/types";
import { ZONES } from "@/lib/zones";

const source: SourceInfo = { name: "Open-Meteo (แบบจำลองสภาพอากาศ + CAMS)", url: "https://open-meteo.com", kind: "model" };

export async function GET() {
  try {
    return respond<ZoneCondition[]>(source, { status: "ok", data: await fetchZoneConditions(ZONES) });
  } catch (e) {
    return respond<ZoneCondition[]>(source, { status: "error", message: errMessage(e) });
  }
}
