import { respond, errMessage } from "@/lib/apiHelpers";
import { fetchHotspots, firmsConfigured } from "@/lib/sources/firms";
import type { HotspotData, SourceInfo } from "@/lib/types";

const source: SourceInfo = { name: "NASA FIRMS (VIIRS S-NPP NRT)", url: "https://firms.modaps.eosdis.nasa.gov", kind: "satellite" };

export async function GET() {
  if (!firmsConfigured()) {
    return respond<HotspotData>(source, { status: "not_configured", message: "ยังไม่ได้ตั้งค่า FIRMS_MAP_KEY" });
  }
  try {
    const hotspots = await fetchHotspots();
    return respond<HotspotData>(source, {
      status: "ok",
      data: { hotspots, windowNote: "การตรวจจับจากดาวเทียมในรอบประมาณ 24 ชั่วโมง ดาวเทียมผ่านเป็นช่วงเวลา การไม่พบจุดไม่ได้ยืนยันว่าไม่มีไฟ" },
    });
  } catch (e) {
    return respond<HotspotData>(source, { status: "error", message: errMessage(e) });
  }
}
