"use client";
import { EmptyState, ErrorState, LoadingState, StaleState } from "@/components/states/states";
import DataKindBadge from "@/components/DataKindBadge";
import { CRITERIA } from "@/lib/assessmentCriteria";
import { STALE_MS } from "@/lib/config";
import { compassThai, formatNumber, formatThaiDateTime } from "@/lib/format";
import { isStale, useNow } from "@/lib/useApi";
import { useEnvData } from "@/lib/useEnvData";
import type { DataKind } from "@/lib/types";

type Row = { id: keyof typeof CRITERIA; name: string; value: string; kind: DataKind; source: string; time?: string; stale: boolean };

export default function AssessmentView() {
  const { weather, air, hotspots } = useEnvData();
  const now = useNow();
  const w = weather.result?.data?.current;
  const a = air.result?.data;
  const h = hotspots.result;
  const rows: Row[] = [];
  if (w) {
    const s = weather.result!.source.name;
    const st = isStale(w.time, now, STALE_MS.weather);
    rows.push(
      { id: "windSpeed", name: "ความเร็วลม", value: `${formatNumber(w.windSpeed, 1)} กม./ชม.`, kind: "model", source: s, time: w.time, stale: st },
      { id: "windDirection", name: "ทิศทางลม (พัดมาจาก)", value: `${compassThai(w.windDirection)} (${Math.round(w.windDirection)}°)`, kind: "model", source: s, time: w.time, stale: st },
      { id: "humidity", name: "ความชื้นสัมพัทธ์", value: `${formatNumber(w.humidity)} %`, kind: "model", source: s, time: w.time, stale: st },
    );
  }
  if (a && a.pm25 !== null) rows.push({ id: "pm25", name: "PM2.5", value: `${formatNumber(a.pm25, 1)} µg/m³`, kind: "model", source: air.result!.source.name, time: a.time, stale: isStale(a.time, now, STALE_MS.air) });
  if (h?.status === "ok" && h.data) rows.push({ id: "hotspots", name: "จุดความร้อนในรอบ ~24 ชม.", value: `${formatNumber(h.data.hotspots.length)} จุด`, kind: "satellite", source: h.source.name, time: h.fetchedAt, stale: false });

  const anyStale = rows.some((r) => r.stale);
  const loading = weather.loading || air.loading || hotspots.loading;

  return (
    <>
      <div className="page-head">
        <h1>ประเมินความเหมาะสมในการเผา</h1>
        <p>หน้านี้แสดงข้อมูลประกอบการพิจารณาเท่านั้น ระบบไม่ตัดสินว่าเผาได้หรือไม่ และไม่กำหนดจำนวนไร่สูงสุด การอนุญาตเป็นอำนาจของหน่วยงานที่รับผิดชอบ</p>
      </div>
      <div className="state warn" role="note" style={{ marginBottom: 14 }}>
        <div><strong>ยังไม่มีเกณฑ์ที่ยืนยัน</strong><p>ยังไม่มีเกณฑ์ทางการที่ตรวจสอบแล้วใส่ในระบบ ผู้ใช้ควรสอบถามองค์การบริหารส่วนตำบล/ที่ทำการอำเภอปาย ก่อนตัดสินใจเผา</p></div>
      </div>
      {loading && <LoadingState />}
      {anyStale && <StaleState>บางค่าเก่ากว่าที่กำหนด โปรดรีเฟรชหรือรอข้อมูลใหม่ก่อนใช้ประกอบการพิจารณา</StaleState>}
      {(weather.networkError || weather.result?.status === "error") && <ErrorState title="ข้อมูลลม/ความชื้นโหลดไม่สำเร็จ" />}
      {(air.networkError || air.result?.status === "error") && <ErrorState title="ข้อมูล PM2.5 โหลดไม่สำเร็จ" />}
      {h?.status === "not_configured" && <EmptyState title="ไม่มีข้อมูลจุดความร้อน">ยังไม่ได้ตั้งค่า FIRMS_MAP_KEY</EmptyState>}
      {rows.length > 0 && (
        <section className="panel glass" style={{ marginTop: 14 }} aria-label="ข้อมูลประกอบการพิจารณา">
          <div className="table-wrap">
            <table>
              <caption className="muted" style={{ textAlign: "left", paddingBottom: 8 }}>ข้อมูลปัจจุบันเทียบกับเกณฑ์</caption>
              <thead><tr><th scope="col">ปัจจัย</th><th scope="col">ค่าปัจจุบัน</th><th scope="col">ประเภท / แหล่งข้อมูล / เวลา</th><th scope="col">เกณฑ์ที่ยืนยัน</th></tr></thead>
              <tbody>
                {rows.map((r) => {
                  const c = CRITERIA[r.id];
                  return (
                    <tr key={r.id}>
                      <th scope="row">{r.name}</th>
                      <td>{r.value}{r.stale && <> <span className="badge stale">ข้อมูลเก่า</span></>}</td>
                      <td><DataKindBadge kind={r.kind} /><div className="muted" style={{ fontSize: "0.85rem" }}>{r.source}<br />{formatThaiDateTime(r.time)}</div></td>
                      <td>{c ? `${c.rule} (${c.source})` : "ยังไม่มีเกณฑ์ที่ยืนยัน"}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </section>
      )}
    </>
  );
}
