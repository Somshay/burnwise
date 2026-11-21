"use client";
import { useMemo, useState } from "react";
import { FilePlus2 } from "lucide-react";
import LocationField, { type LatLon } from "@/components/LocationField";
import NotPersistedNotice from "@/components/NotPersistedNotice";
import { EmptyState } from "@/components/states/states";
import { compassThai, formatThaiDateTime } from "@/lib/format";
import { useApi } from "@/lib/useApi";
import type { BoundaryData, WeatherData } from "@/lib/types";

const MATERIALS = ["ฟางข้าว", "ตอซังข้าวโพด", "ใบอ้อย", "เศษกิ่งไม้/ใบไม้", "อื่น ๆ"];

export default function BurnRequestView() {
  const weather = useApi<WeatherData>("/api/weather");
  const boundary = useApi<BoundaryData>("/api/boundary");
  const [plot, setPlot] = useState("");
  const [area, setArea] = useState("");
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [material, setMaterial] = useState(MATERIALS[0]);
  const [loc, setLoc] = useState<LatLon>(null);
  const [done, setDone] = useState(false);

  const startIso = date && time ? `${date}T${time}:00+07:00` : "";
  const hour = useMemo(() => {
    const list = weather.result?.data?.hourly;
    if (!list?.length || !startIso) return null;
    const t = new Date(startIso).getTime();
    const hit = list.find((h) => Math.abs(new Date(h.time).getTime() - t) <= 30 * 60 * 1000);
    return hit ?? null;
  }, [weather.result, startIso]);
  const outOfRange = Boolean(startIso && weather.result?.data && !hour);

  return (
    <>
      <div className="page-head">
        <h1>ยื่นคำขอเผา</h1>
        <p>กรอกข้อมูลแปลงและช่วงเวลาที่ต้องการ ระบบแสดงทิศทางลมจากแบบจำลองประกอบเท่านั้น ขณะนี้ยังไม่มีระบบรับคำขอ จึงไม่มีการส่ง บันทึก หรืออนุมัติ</p>
      </div>
      <div className="panel glass">
        <form onSubmit={(e) => { e.preventDefault(); setDone(true); }}>
          <EmptyState title="ยังไม่มีทะเบียนแปลงในระบบ">กรอกชื่อหรือรหัสแปลงเอง เมื่อมีฐานข้อมูลแปลงจึงจะเลือกจากรายการได้</EmptyState>
          <div className="row">
            <div className="field"><label htmlFor="plot">ชื่อ / รหัสแปลง</label><input id="plot" type="text" value={plot} onChange={(e) => setPlot(e.target.value)} required /></div>
            <div className="field"><label htmlFor="area">พื้นที่ (ไร่)</label><input id="area" type="number" min="0.01" step="0.01" inputMode="decimal" value={area} onChange={(e) => setArea(e.target.value)} required /></div>
          </div>
          <div className="row">
            <div className="field"><label htmlFor="date">วันที่</label><input id="date" type="date" value={date} onChange={(e) => setDate(e.target.value)} required /></div>
            <div className="field"><label htmlFor="time">เวลาเริ่ม</label><input id="time" type="time" value={time} onChange={(e) => setTime(e.target.value)} required /></div>
            <div className="field"><label htmlFor="material">ชนิดวัสดุ</label><select id="material" value={material} onChange={(e) => setMaterial(e.target.value)}>{MATERIALS.map((m) => <option key={m}>{m}</option>)}</select></div>
          </div>
          <LocationField
            value={loc}
            onChange={setLoc}
            mapExtra={{ boundary: boundary.result?.data?.geojson, sector: loc && hour ? { origin: loc, windFrom: hour.windDirection } : null }}
          />
          <section aria-label="ตัวอย่างทิศทางลม" aria-live="polite">
            <h2>ตัวอย่างทิศทางลม</h2>
            {!startIso && <p className="muted">เลือกวันที่และเวลาเพื่อดูทิศทางลม</p>}
            {weather.result?.status === "error" && <p className="muted">โหลดข้อมูลลมไม่สำเร็จ จึงไม่แสดงตัวอย่าง</p>}
            {outOfRange && <p className="muted">เวลาที่เลือกอยู่นอกช่วงพยากรณ์ (ประมาณ 3 วัน) จึงไม่มีตัวอย่าง</p>}
            {hour && (
              <p>ลมจากทิศ{compassThai(hour.windDirection)} ({Math.round(hour.windDirection)}°) ความเร็ว {hour.windSpeed.toFixed(1)} กม./ชม. · เวลา {formatThaiDateTime(hour.time)} · แหล่งข้อมูล: Open-Meteo (แบบจำลอง)
                {loc ? <><br />ภาพกลีบพัดบนแผนที่ชี้ไปทางที่ลมพัดไป <strong>ภาพประกอบทิศทางลมเท่านั้น ไม่ใช่การคาดการณ์ควันหรือเขตอันตราย</strong></> : <><br />ปักหมุดตำแหน่งเพื่อดูภาพประกอบบนแผนที่</>}</p>
            )}
          </section>
          <button type="submit" className="btn primary"><FilePlus2 size={18} strokeWidth={1.75} aria-hidden="true" />ตรวจสอบคำขอนี้</button>
        </form>
      </div>
      {done && (
        <div className="grid" style={{ marginTop: 14 }}>
          <NotPersistedNotice what="คำขอเผานี้" />
          <div className="panel glass">
            <h2>สรุปที่กรอก (ยังไม่ใช่คำขอที่ยื่นแล้ว)</h2>
            <p>แปลง: {plot} · {area} ไร่<br />วัสดุ: {material}<br />กำหนดเริ่ม: {date} {time}<br />ตำแหน่ง: {loc ? `${loc.lat.toFixed(5)}, ${loc.lon.toFixed(5)}` : "—"}<br /><strong>สถานะ: ยังไม่ได้ส่ง ยังไม่ได้รับการอนุมัติ</strong></p>
          </div>
        </div>
      )}
    </>
  );
}
