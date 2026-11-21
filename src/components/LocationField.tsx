"use client";
import { LocateFixed } from "lucide-react";
import { useState } from "react";
import PaiMapLazy from "./map/PaiMapLazy";
import type { MapProps } from "./map/PaiMap";
import { PAI_BBOX } from "@/lib/config";

export type LatLon = { lat: number; lon: number } | null;

export default function LocationField({ value, onChange, mapExtra }: { value: LatLon; onChange: (v: LatLon) => void; mapExtra?: Partial<MapProps> }) {
  const [geoMsg, setGeoMsg] = useState("");
  const inBox = (p: { lat: number; lon: number }) => p.lat >= PAI_BBOX.south && p.lat <= PAI_BBOX.north && p.lon >= PAI_BBOX.west && p.lon <= PAI_BBOX.east;
  const outside = value && !inBox(value);

  function locate() {
    if (!navigator.geolocation) return setGeoMsg("เบราว์เซอร์นี้ไม่รองรับการระบุตำแหน่ง");
    setGeoMsg("กำลังขอตำแหน่ง…");
    navigator.geolocation.getCurrentPosition(
      (pos) => { onChange({ lat: pos.coords.latitude, lon: pos.coords.longitude }); setGeoMsg("ใช้ตำแหน่งปัจจุบันแล้ว"); },
      () => setGeoMsg("ขอตำแหน่งไม่สำเร็จ โปรดคลิกบนแผนที่หรือกรอกพิกัดเอง"),
      { timeout: 10_000 },
    );
  }

  return (
    <fieldset>
      <legend>ตำแหน่ง</legend>
      <p className="hint muted">คลิกบนแผนที่ ใช้ตำแหน่งปัจจุบัน หรือกรอกละติจูด/ลองจิจูดเอง</p>
      <PaiMapLazy label="แผนที่เลือกตำแหน่ง คลิกเพื่อปักหมุด" picked={value} onPick={(p) => onChange(p)} showWind={false} showHotspots={false} {...mapExtra} />
      <div className="row" style={{ marginTop: 12 }}>
        <div className="field">
          <label htmlFor="lat">ละติจูด</label>
          <input id="lat" type="number" step="any" inputMode="decimal" value={value?.lat ?? ""} onChange={(e) => onChange(e.target.value === "" ? null : { lat: Number(e.target.value), lon: value?.lon ?? 0 })} required />
        </div>
        <div className="field">
          <label htmlFor="lon">ลองจิจูด</label>
          <input id="lon" type="number" step="any" inputMode="decimal" value={value?.lon ?? ""} onChange={(e) => onChange(e.target.value === "" ? null : { lat: value?.lat ?? 0, lon: Number(e.target.value) })} required />
        </div>
      </div>
      <div className="actions" style={{ marginTop: 8 }}>
        <button type="button" className="btn" onClick={locate}><LocateFixed size={18} strokeWidth={1.75} aria-hidden="true" />ใช้ตำแหน่งปัจจุบัน</button>
        <span className="muted" role="status" aria-live="polite">{geoMsg}</span>
      </div>
      {outside && <p role="status" style={{ color: "var(--warn)", marginTop: 8 }}>พิกัดนี้อยู่นอกกรอบพื้นที่ต้นแบบอำเภอปาย (โดยประมาณ)</p>}
    </fieldset>
  );
}
