import { respond, errMessage } from "@/lib/apiHelpers";
import { fetchAir } from "@/lib/sources/openMeteo";
import type { AirData, SourceInfo } from "@/lib/types";

const source: SourceInfo = { name: "Open-Meteo Air Quality (แบบจำลอง CAMS)", url: "https://open-meteo.com/en/docs/air-quality-api", kind: "model" };

export async function GET() {
  try {
    return respond<AirData>(source, { status: "ok", data: await fetchAir() });
  } catch (e) {
    return respond<AirData>(source, { status: "error", message: errMessage(e) });
  }
}
