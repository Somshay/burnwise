"use client";
import { useState } from "react";
import { Flame } from "lucide-react";
import LocationField, { type LatLon } from "@/components/LocationField";
import NotPersistedNotice from "@/components/NotPersistedNotice";
import { formatThaiDateTime } from "@/lib/format";

export default function ReportView() {
  const [loc, setLoc] = useState<LatLon>(null);
  const [when, setWhen] = useState("");
  const [details, setDetails] = useState("");
  const [preview, setPreview] = useState<{ url: string; name: string } | null>(null);
  const [done, setDone] = useState(false);

  function onFile(f: File | undefined) {
    if (preview) URL.revokeObjectURL(preview.url);
    setPreview(f ? { url: URL.createObjectURL(f), name: f.name } : null);
  }
  function setNow() {
    const d = new Date();
    d.setMinutes(d.getMinutes() - d.getTimezoneOffset());
    setWhen(d.toISOString().slice(0, 16));
  }

  return (
    <>
      <div className="page-head">
        <h1>รายงานเหตุไฟ</h1>
        <p>กรอกข้อมูลเหตุไฟเพื่อเตรียมรายงาน ขณะนี้ระบบยังไม่มีหลังบ้าน แบบฟอร์มนี้จึงไม่ส่งหรือบันทึกข้อมูลใด ๆ หากพบไฟที่ควบคุมไม่ได้ ให้โทร 191 / 199 ทันที</p>
      </div>
      <div className="panel glass">
        <form onSubmit={(e) => { e.preventDefault(); setDone(true); }}>
          <LocationField value={loc} onChange={setLoc} />
          <div className="field">
            <label htmlFor="when">วันและเวลาที่พบ</label>
            <div className="row">
              <input id="when" type="datetime-local" value={when} onChange={(e) => setWhen(e.target.value)} required />
              <button type="button" className="btn" onClick={setNow}>ใช้เวลาปัจจุบัน</button>
            </div>
          </div>
          <div className="field">
            <label htmlFor="details">รายละเอียด</label>
            <textarea id="details" value={details} onChange={(e) => setDetails(e.target.value)} required placeholder="เช่น ลักษณะไฟ ขนาดโดยประมาณ ใกล้หมู่บ้านหรือป่า" />
          </div>
          <div className="field">
            <label htmlFor="photo">แนบรูปภาพ (ไม่บังคับ)</label>
            <input id="photo" type="file" accept="image/*" onChange={(e) => onFile(e.target.files?.[0])} />
            <span className="hint muted">รูปแสดงตัวอย่างในเบราว์เซอร์นี้เท่านั้น ไม่ถูกอัปโหลด</span>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            {preview && <img src={preview.url} alt={`ตัวอย่างรูปที่แนบ: ${preview.name}`} style={{ maxWidth: 280, borderRadius: 12 }} />}
          </div>
          <button type="submit" className="btn primary"><Flame size={18} strokeWidth={1.75} aria-hidden="true" />ตรวจสอบรายงานนี้</button>
        </form>
      </div>
      {done && (
        <div className="grid" style={{ marginTop: 14 }}>
          <NotPersistedNotice what="รายงานเหตุไฟนี้" />
          <div className="panel glass">
            <h2>สรุปที่กรอก (อยู่ในหน้านี้เท่านั้น)</h2>
            <p>ตำแหน่ง: {loc ? `${loc.lat.toFixed(5)}, ${loc.lon.toFixed(5)}` : "—"}<br />เวลา: {formatThaiDateTime(when ? new Date(when).toISOString() : undefined)}<br />รายละเอียด: {details}<br />รูปภาพ: {preview ? preview.name : "ไม่มี"}</p>
          </div>
        </div>
      )}
    </>
  );
}
