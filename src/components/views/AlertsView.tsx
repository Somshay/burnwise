"use client";
import { EmptyState } from "@/components/states/states";
import { useLocalStore } from "@/lib/useLocalStore";

const DEFAULTS = { pm25: true, hotspots: true, wind: false, burnWindow: false, channel: "browser" };
const TOPICS: { key: "pm25" | "hotspots" | "wind" | "burnWindow"; label: string }[] = [
  { key: "pm25", label: "PM2.5 สูงในพื้นที่" },
  { key: "hotspots", label: "พบจุดความร้อนใกล้พื้นที่ของฉัน" },
  { key: "wind", label: "ทิศทาง/ความเร็วลมเปลี่ยนแปลงมาก" },
  { key: "burnWindow", label: "ประกาศช่วงเวลาเผา (เมื่อมีข้อมูลทางการ)" },
];

export default function AlertsView() {
  const [s, setS] = useLocalStore("burnwise-alerts", DEFAULTS);
  return (
    <>
      <div className="page-head">
        <h1>การแจ้งเตือน</h1>
        <p>ตั้งค่าหัวข้อที่สนใจ การตั้งค่าเก็บในเบราว์เซอร์นี้เท่านั้น</p>
      </div>
      <div className="grid">
        <EmptyState title="สถานะ: ยังไม่มีระบบส่ง Push/SMS">ตอนนี้ระบบยังไม่ส่งการแจ้งเตือนใด ๆ ทั้งทางเบราว์เซอร์ SMS หรืออีเมล ค่าที่เลือกด้านล่างจะถูกใช้เมื่อมีระบบส่งจริง</EmptyState>
        <form className="panel glass" onSubmit={(e) => e.preventDefault()}>
          <fieldset>
            <legend>หัวข้อที่สนใจ</legend>
            <div className="toggle-list">
              {TOPICS.map((t) => (
                <label className="check" key={t.key}><input type="checkbox" checked={s[t.key]} onChange={(e) => setS({ ...s, [t.key]: e.target.checked })} />{t.label}</label>
              ))}
            </div>
          </fieldset>
          <div className="field">
            <label htmlFor="channel">ช่องทางที่ต้องการ</label>
            <select id="channel" value={s.channel} onChange={(e) => setS({ ...s, channel: e.target.value })}>
              <option value="browser">แจ้งเตือนผ่านเบราว์เซอร์ (ยังไม่เปิดใช้งาน)</option>
              <option value="sms">SMS (ยังไม่เปิดใช้งาน)</option>
            </select>
          </div>
          <p className="muted" role="status">บันทึกในเบราว์เซอร์นี้อัตโนมัติ</p>
        </form>
      </div>
    </>
  );
}
