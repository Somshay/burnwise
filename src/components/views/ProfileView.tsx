"use client";
import { EmptyState } from "@/components/states/states";
import { useTheme, type ThemePref } from "@/lib/theme";
import { useLocalStore } from "@/lib/useLocalStore";

export default function ProfileView() {
  const [p, setP] = useLocalStore("burnwise-profile", { name: "", subdistrict: "" });
  const [theme, setTheme] = useTheme();
  return (
    <>
      <div className="page-head">
        <h1>โปรไฟล์</h1>
        <p>ข้อมูลที่กรอกเก็บในเบราว์เซอร์นี้เท่านั้น ไม่ถูกส่งไปที่เซิร์ฟเวอร์</p>
      </div>
      <div className="grid">
        <EmptyState title="ยังไม่มีระบบสมาชิก">ยังไม่มีการสมัคร เข้าสู่ระบบ หรือบัญชีผู้ใช้จริง ข้อมูลด้านล่างเป็นเพียงค่าที่จำในเครื่องของคุณ</EmptyState>
        <form className="panel glass" onSubmit={(e) => e.preventDefault()}>
          <div className="field"><label htmlFor="name">ชื่อ (ไม่บังคับ)</label><input id="name" type="text" value={p.name} onChange={(e) => setP({ ...p, name: e.target.value })} autoComplete="name" /></div>
          <div className="field"><label htmlFor="sub">ตำบล (ไม่บังคับ)</label><input id="sub" type="text" value={p.subdistrict} onChange={(e) => setP({ ...p, subdistrict: e.target.value })} /></div>
          <div className="field">
            <label htmlFor="theme">ธีมหน้าจอ</label>
            <select id="theme" value={theme} onChange={(e) => setTheme(e.target.value as ThemePref)}>
              <option value="system">ตามระบบ</option><option value="light">สว่าง</option><option value="dark">มืด</option>
            </select>
          </div>
        </form>
      </div>
    </>
  );
}
