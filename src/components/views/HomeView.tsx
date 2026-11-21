"use client";
import { ChevronDown, LocateFixed, Wind } from "lucide-react";
import { useState } from "react";
import PaiMapLazy from "@/components/map/PaiMapLazy";
import { compassThai, formatNumber } from "@/lib/format";
import { PAI_BBOX } from "@/lib/config";
import { GEO_MESSAGE, useGeolocation } from "@/lib/useGeolocation";
import { useApi } from "@/lib/useApi";
import { useEnvData } from "@/lib/useEnvData";
import type { BoundaryData, FarmlandData } from "@/lib/types";
import DashboardView from "./DashboardView";

export default function HomeView() {
  const env = useEnvData();
  const boundary = useApi<BoundaryData>("/api/boundary");
  const farmland = useApi<FarmlandData>("/api/farmland");
  const geo = useGeolocation();
  const inPai = geo.pos && geo.pos.lat >= PAI_BBOX.south && geo.pos.lat <= PAI_BBOX.north && geo.pos.lon >= PAI_BBOX.west && geo.pos.lon <= PAI_BBOX.east;
  const [layers, setLayers] = useState({ farmland: true, wind: true, hotspots: true });
  const cur = env.weather.result?.data?.current;
  const fl = farmland.result;
  const toggle = (k: keyof typeof layers) => setLayers((l) => ({ ...l, [k]: !l[k] }));

  return (
    <>
      <section id="map" aria-label="แผนที่พื้นที่การเกษตร" className="hero">
        <div className="hero-map">
          <PaiMapLazy
            label="แผนที่พื้นที่การเกษตร อำเภอปาย"
            fill
            user={geo.pos}
            boundary={boundary.result?.data?.geojson}
            farmland={fl?.data?.geojson}
            hotspots={env.hotspots.result?.data?.hotspots}
            wind={cur ? { speed: cur.windSpeed, direction: cur.windDirection } : undefined}
            showFarmland={layers.farmland}
            showWind={layers.wind}
            showHotspots={layers.hotspots}
          />
          <div className="hero-chips" role="group" aria-label="ชั้นข้อมูลบนแผนที่">
            <button type="button" className="chip glass" aria-pressed={layers.farmland} onClick={() => toggle("farmland")}>พื้นที่เกษตร</button>
            <button type="button" className="chip glass" aria-pressed={layers.wind} onClick={() => toggle("wind")}>ลม</button>
            <button type="button" className="chip glass" aria-pressed={layers.hotspots} onClick={() => toggle("hotspots")}>จุดความร้อน</button>
          </div>
          <button type="button" className="locate-btn glass" onClick={geo.locate} disabled={geo.status === "asking"} aria-label="ใช้ตำแหน่งปัจจุบันของฉัน (GPS)">
            <LocateFixed size={24} strokeWidth={1.75} aria-hidden="true" />
          </button>
          <div className="hero-info glass" role="status" aria-live="polite">
            {geo.status === "ok" && geo.pos && (
              <p><strong>ตำแหน่งของคุณ</strong> {geo.pos.lat.toFixed(5)}, {geo.pos.lon.toFixed(5)} (± {Math.round(geo.pos.accuracy)} ม.){inPai === false && " · อยู่นอกพื้นที่ต้นแบบอำเภอปาย"}</p>
            )}
            {geo.status !== "ok" && geo.status !== "idle" && <p role="alert">{GEO_MESSAGE[geo.status]}</p>}
            {cur && (
              <p><Wind size={16} strokeWidth={1.75} aria-hidden="true" style={{ verticalAlign: -3 }} /> ลมจากทิศ{compassThai(cur.windDirection)} {formatNumber(cur.windSpeed, 1)} กม./ชม. <span className="badge model">แบบจำลอง</span></p>
            )}
            {fl?.status === "ok" && fl.data && (
              <p>พื้นที่เกษตรจากแผนที่ OSM {fl.data.count} แปลง <strong>(ไม่ครบ และไม่ใช่ทะเบียนแปลงทางการ)</strong></p>
            )}
            {farmland.loading && !fl && <p>กำลังโหลดพื้นที่เกษตร…</p>}
            {(farmland.networkError || fl?.status === "error") && (
              <p>โหลดพื้นที่เกษตรไม่สำเร็จ <button type="button" className="link-btn" onClick={farmland.refresh}>ลองใหม่</button></p>
            )}
            {env.hotspots.result?.status === "not_configured" && <p>จุดความร้อน: ยังไม่ได้ตั้งค่าแหล่งข้อมูล</p>}
          </div>
        </div>
        <a href="#dashboard" className="scroll-cue">เลื่อนลงดูแดชบอร์ด <ChevronDown size={20} strokeWidth={1.75} aria-hidden="true" /></a>
      </section>

      <section id="dashboard" className="container" aria-label="แดชบอร์ด">
        <DashboardView env={env} />
      </section>
    </>
  );
}
