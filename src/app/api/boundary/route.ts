import { respond, errMessage } from "@/lib/apiHelpers";
import { fetchBoundary } from "@/lib/sources/boundary";
import type { BoundaryData, SourceInfo } from "@/lib/types";

const source: SourceInfo = { name: "OpenStreetMap (Nominatim) © ผู้ร่วมจัดทำ OpenStreetMap", url: "https://www.openstreetmap.org/copyright", kind: "observed" };

export async function GET() {
  try {
    return respond<BoundaryData>(source, { status: "ok", data: await fetchBoundary() });
  } catch (e) {
    return respond<BoundaryData>(source, { status: "error", message: errMessage(e) });
  }
}
