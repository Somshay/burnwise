import { respond, errMessage, pointFromUrl } from "@/lib/apiHelpers";
import { fetchAir } from "@/lib/sources/openMeteo";
import type { AirData, SourceInfo } from "@/lib/types";

const source: SourceInfo = { name: "Open-Meteo Air Quality (แบบจำลอง CAMS)", url: "https://open-meteo.com/en/docs/air-quality-api", kind: "model" };

export async function GET(request: Request) {
  const { lat, lon } = pointFromUrl(request.url);
  try {
    return respond<AirData>(source, { status: "ok", data: await fetchAir(lat, lon) });
  } catch (e) {
    return respond<AirData>(source, { status: "error", message: errMessage(e) });
  }
}
