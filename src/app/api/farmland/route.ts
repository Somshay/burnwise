import { respond, errMessage } from "@/lib/apiHelpers";
import { fetchFarmland } from "@/lib/sources/farmland";
import type { FarmlandData, SourceInfo } from "@/lib/types";

const source: SourceInfo = { name: "OpenStreetMap (Overpass) © ผู้ร่วมจัดทำ OpenStreetMap", url: "https://www.openstreetmap.org/copyright", kind: "observed" };

export async function GET() {
  try {
    return respond<FarmlandData>(source, { status: "ok", data: await fetchFarmland() });
  } catch (e) {
    return respond<FarmlandData>(source, { status: "error", message: errMessage(e) });
  }
}
