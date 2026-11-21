"use client";
import { CloudFog, Compass, Droplets, Flame, Gauge, RefreshCw, Thermometer, Wind } from "lucide-react";
import MetricCard from "@/components/MetricCard";
import { EmptyState, ErrorState, LoadingState } from "@/components/states/states";
import { STALE_MS } from "@/lib/config";
import { compassThai, formatNumber, formatThaiDateTime } from "@/lib/format";
import { isStale, useNow } from "@/lib/useApi";
import { useEnvData } from "@/lib/useEnvData";

const I = { size: 20, strokeWidth: 1.75, "aria-hidden": true } as const;

export default function DashboardView({ env }: { env: ReturnType<typeof useEnvData> }) {
  const { weather, air, hotspots, stations, refresh, loading } = env;
  const now = useNow();
  const w = weather.result?.data?.current;
  const a = air.result?.data;
  const h = hotspots.result;
  const wSrc = weather.result?.source.name ?? "Open-Meteo";
  const wStale = isStale(w?.time, now, STALE_MS.weather);
  const lastUpdate = weather.result?.fetchedAt;

  return (
    <>
      <div className="page-head">
        <h2 style={{ fontSize: "1.4rem" }}>แดชบอร์ด · อำเภอปาย</h2>
        <p>ค่าสภาพอากาศและฝุ่นล่าสุด ทุกค่าระบุแหล่งข้อมูล ประเภท และเวลา ลมและ PM2.5 เป็นผลจากแบบจำลอง ไม่ใช่ค่าที่วัดจากสถานีในพื้นที่</p>
        <div className="actions">
          <button type="button" className="btn" onClick={refresh} disabled={loading}><RefreshCw size={18} strokeWidth={1.75} aria-hidden="true" />รีเฟรช</button>
          <span className="muted" aria-live="polite">{loading ? "กำลังอัปเดต…" : `ดึงข้อมูลเมื่อ ${formatThaiDateTime(lastUpdate)}`}</span>
        </div>
      </div>

      {weather.loading && !weather.result && <LoadingState label="กำลังโหลดข้อมูลสภาพอากาศ…" />}
      {(weather.networkError || weather.result?.status === "error") && (
        <ErrorState title="โหลดข้อมูลสภาพอากาศไม่สำเร็จ">เชื่อมต่อ Open-Meteo ไม่ได้ในขณะนี้ ไม่มีการแสดงค่าสมมติแทน ลองรีเฟรชอีกครั้ง</ErrorState>
      )}

      <section aria-label="ค่าสภาพอากาศ" className="grid cards compact" style={{ marginTop: 14 }}>
        {w && (
          <>
            <MetricCard icon={<Thermometer {...I} />} title="อุณหภูมิ" value={formatNumber(w.temperature, 1)} unit="°C" kind="model" source={wSrc} time={w.time} stale={wStale} />
            <MetricCard icon={<Wind {...I} />} title="ความเร็วลม (ที่ 10 ม.)" value={formatNumber(w.windSpeed, 1)} unit="กม./ชม." kind="model" source={wSrc} time={w.time} stale={wStale} />
            <MetricCard
              icon={<Compass {...I} />}
              title="ทิศทางลม (ลมพัดมาจาก)"
              value={<span style={{ display: "inline-flex", alignItems: "center", gap: 10 }}>{compassThai(w.windDirection)}<span aria-hidden="true" style={{ display: "inline-block", transform: `rotate(${(w.windDirection + 180) % 360}deg)` }}>↑</span></span>}
              unit={`${Math.round(w.windDirection)}°`}
              kind="model" source={wSrc} time={w.time} stale={wStale}
              note="ลูกศรชี้ไปทางที่ลมพัดไป"
            />
            <MetricCard icon={<Droplets {...I} />} title="ความชื้นสัมพัทธ์" value={formatNumber(w.humidity)} unit="%" kind="model" source={wSrc} time={w.time} stale={wStale} />
            <MetricCard icon={<Gauge {...I} />} title="ความกดอากาศที่ผิวพื้น" value={formatNumber(w.pressure, 1)} unit="hPa" kind="model" source={wSrc} time={w.time} stale={wStale} />
          </>
        )}

        {air.loading && !air.result && <LoadingState label="กำลังโหลด PM2.5…" />}
        {a && a.pm25 !== null && (
          <MetricCard icon={<CloudFog {...I} />} title="PM2.5" value={formatNumber(a.pm25, 1)} unit="µg/m³" kind="model" source={air.result!.source.name} time={a.time} stale={isStale(a.time, now, STALE_MS.air)} note="ค่าจากแบบจำลอง ไม่ใช่ค่าจากเครื่องวัดในพื้นที่" />
        )}
        {a && a.pm25 === null && <EmptyState title="PM2.5">แหล่งข้อมูลไม่มีค่า ณ เวลานี้</EmptyState>}
        {(air.networkError || air.result?.status === "error") && <ErrorState title="PM2.5 โหลดไม่สำเร็จ">ลองรีเฟรชอีกครั้ง</ErrorState>}

        {hotspots.loading && !h && <LoadingState label="กำลังโหลดจุดความร้อน…" />}
        {h?.status === "ok" && h.data && (
          <MetricCard icon={<Flame {...I} />} title="จุดความร้อน (ดาวเทียม)" value={formatNumber(h.data.hotspots.length)} unit="จุด" kind="satellite" source={h.source.name} time={h.data.hotspots.map((x) => x.acquiredAt).sort().at(-1) ?? h.fetchedAt} stale={isStale(h.data.hotspots.length ? h.data.hotspots.map((x) => x.acquiredAt).sort().at(-1) : h.fetchedAt, now, STALE_MS.hotspots)} note={h.data.windowNote} />
        )}
        {h?.status === "not_configured" && (
          <EmptyState title="จุดความร้อน: ยังไม่ได้ตั้งค่าแหล่งข้อมูล">ตั้งค่า FIRMS_MAP_KEY ในไฟล์ .env.local (ดู .env.example) จึงยังไม่แสดงจำนวนจุดความร้อน และไม่ได้หมายความว่าไม่มีไฟ</EmptyState>
        )}
        {(hotspots.networkError || h?.status === "error") && <ErrorState title="จุดความร้อนโหลดไม่สำเร็จ">ลองรีเฟรชอีกครั้ง</ErrorState>}
      </section>

      <section aria-label="สถานีตรวจวัดจริง" style={{ marginTop: 22 }}>
        <h2>ข้อมูลสถานีตรวจวัดจริง</h2>
        {stations.result?.status === "not_configured" && <EmptyState title="ยังไม่ได้เชื่อมต่อสถานีตรวจวัด">ตั้งค่า STATION_API_URL เพื่อแสดงค่าที่วัดจริง ปัจจุบันค่าทั้งหมดบนหน้านี้เป็นข้อมูลแบบจำลองหรือดาวเทียม</EmptyState>}
        {stations.result?.status === "error" && <ErrorState title="โหลดข้อมูลสถานีไม่สำเร็จ">{stations.result.message}</ErrorState>}
        {stations.result?.status === "ok" && stations.result.data && (
          stations.result.data.stations.length === 0 ? <EmptyState title="ไม่มีข้อมูลสถานี" /> : (
            <div className="grid cards compact">
              {stations.result.data.stations.map((s) => (
                <MetricCard key={s.id} icon={<Gauge {...I} />} title={s.name} value={s.pm25 !== undefined ? formatNumber(s.pm25, 1) : "—"} unit={s.pm25 !== undefined ? "µg/m³ (PM2.5)" : undefined} kind="observed" source={stations.result!.source.name} time={s.observedAt} stale={isStale(s.observedAt, now, STALE_MS.stations)} />
              ))}
            </div>
          )
        )}
      </section>
    </>
  );
}
