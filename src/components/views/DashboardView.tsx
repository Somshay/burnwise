"use client";
import { CloudFog, Compass, Droplets, Flame, Gauge, Thermometer, Wind } from "lucide-react";
import MetricCard from "@/components/MetricCard";
import { compassThai, formatNumber } from "@/lib/format";
import type { useEnvData } from "@/lib/useEnvData";

const I = { size: 20, strokeWidth: 1.75, "aria-hidden": true } as const;
const NONE = "ไม่มีข้อมูล";

export default function DashboardView({ env }: { env: ReturnType<typeof useEnvData> }) {
  const { weather, air, hotspots, stations } = env;
  const w = weather.result?.data?.current;
  const pm = air.result?.data?.pm25;
  const hs = hotspots.result;
  const failed = (weather.networkError || weather.result?.status === "error") ? "โหลดข้อมูลสภาพอากาศไม่สำเร็จ" : null;

  return (
    <>
      <h2 style={{ fontSize: "1.4rem" }}>แดชบอร์ด</h2>
      {failed && <p role="alert" className="muted">{failed}</p>}
      <section aria-label="ค่าสภาพอากาศ" className="grid cards compact" style={{ marginTop: 10 }}>
        <MetricCard icon={<Thermometer {...I} />} title="อุณหภูมิ" value={w ? formatNumber(w.temperature, 1) : NONE} unit={w ? "°C" : undefined} />
        <MetricCard icon={<Wind {...I} />} title="ความเร็วลม" value={w ? formatNumber(w.windSpeed, 1) : NONE} unit={w ? "กม./ชม." : undefined} />
        <MetricCard
          icon={<Compass {...I} />}
          title="ทิศทางลม"
          value={w ? <span style={{ display: "inline-flex", alignItems: "center", gap: 8 }}>{compassThai(w.windDirection)}<span aria-hidden="true" style={{ display: "inline-block", transform: `rotate(${(w.windDirection + 180) % 360}deg)` }}>↑</span></span> : NONE}
          unit={w ? `${Math.round(w.windDirection)}°` : undefined}
        />
        <MetricCard icon={<Droplets {...I} />} title="ความชื้น" value={w ? formatNumber(w.humidity) : NONE} unit={w ? "%" : undefined} />
        <MetricCard icon={<Gauge {...I} />} title="ความกดอากาศ" value={w ? formatNumber(w.pressure, 1) : NONE} unit={w ? "hPa" : undefined} />
        <MetricCard icon={<CloudFog {...I} />} title="PM2.5" value={typeof pm === "number" ? formatNumber(pm, 1) : NONE} unit={typeof pm === "number" ? "µg/m³" : undefined} />
        <MetricCard icon={<Flame {...I} />} title="จุดความร้อน" value={hs?.status === "ok" && hs.data ? formatNumber(hs.data.hotspots.length) : NONE} unit={hs?.status === "ok" ? "จุด" : undefined} />
        {stations.result?.status === "ok" && stations.result.data?.stations.map((s) => (
          <MetricCard key={s.id} icon={<Gauge {...I} />} title={s.name} value={s.pm25 !== undefined ? formatNumber(s.pm25, 1) : NONE} unit={s.pm25 !== undefined ? "µg/m³" : undefined} />
        ))}
      </section>
    </>
  );
}
