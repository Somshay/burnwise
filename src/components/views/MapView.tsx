"use client";
import Link from "next/link";
import { useState } from "react";
import { Flame } from "lucide-react";
import PaiMapLazy from "@/components/map/PaiMapLazy";
import { EmptyState, ErrorState } from "@/components/states/states";
import { useApi } from "@/lib/useApi";
import { useEnvData } from "@/lib/useEnvData";
import type { BoundaryData } from "@/lib/types";

export default function MapView() {
  const boundary = useApi<BoundaryData>("/api/boundary");
  const { weather, hotspots } = useEnvData();
  const [showWind, setShowWind] = useState(true);
  const [showHot, setShowHot] = useState(true);
  const cur = weather.result?.data?.current;
  const hs = hotspots.result;

  return (
    <>
      <div className="page-head">
        <h1>แผนที่อำเภอปาย</h1>
        <p>แสดงขอบเขตอำเภอ จุดความร้อนจากดาวเทียม (เมื่อตั้งค่าแหล่งข้อมูลแล้ว) และทิศทาง/ความเร็วลมปัจจุบันจากแบบจำลอง</p>
      </div>
      <div className="panel glass" style={{ marginBottom: 14 }}>
        <fieldset>
          <legend>ชั้นข้อมูล</legend>
          <div className="row">
            <label className="check"><input type="checkbox" checked={showWind} onChange={(e) => setShowWind(e.target.checked)} />ลม (แบบจำลอง)</label>
            <label className="check"><input type="checkbox" checked={showHot} onChange={(e) => setShowHot(e.target.checked)} />จุดความร้อน (ดาวเทียม)</label>
          </div>
        </fieldset>
        <p className="legend" style={{ marginTop: 10 }}>
          <span><i style={{ background: "#e8590c" }} />จุดความร้อนจากดาวเทียม</span>
          <span><i style={{ background: "#1864ab" }} />ลูกศรลม (ชี้ไปทางที่ลมพัดไป)</span>
          <span><i style={{ background: "transparent", border: "2px solid #c2410c" }} />ขอบเขตอำเภอ (OpenStreetMap)</span>
        </p>
      </div>

      <PaiMapLazy
        label="แผนที่อำเภอปาย"
        tall
        boundary={boundary.result?.data?.geojson}
        hotspots={hs?.data?.hotspots}
        wind={cur ? { speed: cur.windSpeed, direction: cur.windDirection } : undefined}
        showWind={showWind}
        showHotspots={showHot}
      />

      <div className="grid" style={{ marginTop: 14 }}>
        {(boundary.networkError || boundary.result?.status === "error") && <ErrorState title="โหลดขอบเขตอำเภอไม่สำเร็จ">ยังแสดงแผนที่พื้นฐานได้ แต่ไม่มีเส้นขอบเขต</ErrorState>}
        {hs?.status === "not_configured" && <EmptyState title="ยังไม่แสดงจุดความร้อน">ยังไม่ได้ตั้งค่า FIRMS_MAP_KEY</EmptyState>}
        {hs?.status === "error" && <ErrorState title="โหลดจุดความร้อนไม่สำเร็จ" />}
        {hs?.status === "ok" && hs.data?.hotspots.length === 0 && <EmptyState title="ไม่พบจุดความร้อนในข้อมูลล่าสุด">{hs.data.windowNote}</EmptyState>}
        {(weather.networkError || weather.result?.status === "error") && <ErrorState title="โหลดข้อมูลลมไม่สำเร็จ" />}
        <EmptyState title="จุดรายงานเหตุ: ยังไม่มี">ยังไม่มีระบบหลังบ้านรับรายงาน จึงไม่มีจุดรายงานเหตุบนแผนที่ รายงานที่กรอกในหน้ารายงานเหตุไฟไม่ถูกส่งหรือบันทึก</EmptyState>
        <div><Link className="btn primary" href="/report"><Flame size={18} strokeWidth={1.75} aria-hidden="true" />รายงานเหตุไฟ</Link></div>
      </div>
    </>
  );
}
