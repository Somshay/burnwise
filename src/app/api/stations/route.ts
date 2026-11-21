import { respond, errMessage } from "@/lib/apiHelpers";
import { fetchStations, stationsConfigured } from "@/lib/sources/stations";
import type { SourceInfo, StationData } from "@/lib/types";

const source: SourceInfo = { name: "สถานีตรวจวัด (STATION_API_URL)", kind: "observed" };

export async function GET() {
  if (!stationsConfigured()) {
    return respond<StationData>(source, { status: "not_configured", message: "ยังไม่ได้ตั้งค่า STATION_API_URL" });
  }
  try {
    return respond<StationData>(source, { status: "ok", data: { stations: await fetchStations() } });
  } catch (e) {
    return respond<StationData>(source, { status: "error", message: errMessage(e) });
  }
}
