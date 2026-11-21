"use client";
import Link from "next/link";
import { ChevronDown, LocateFixed } from "lucide-react";
import { useMemo, useState } from "react";
import PaiMapLazy from "@/components/map/PaiMapLazy";
import { GEO_MESSAGE, useGeolocation } from "@/lib/useGeolocation";
import { isStale, useApi, useNow } from "@/lib/useApi";
import { useEnvData } from "@/lib/useEnvData";
import type { BoundaryData, FarmlandData, ZoneCondition } from "@/lib/types";
import ZoneSheet from "@/components/ZoneSheet";
import { BURN_LOG_KEY, EMPTY_LOG, type BurnLog } from "@/lib/burnLog";
import { useLocalStore } from "@/lib/useLocalStore";
import { CRITERIA_ARE_SAMPLE } from "@/lib/criteria";
import { evaluate, VERDICT_TEXT, type Verdict } from "@/lib/evaluate";
import { STALE_MS } from "@/lib/config";
import { nearestZone, ZONES, ZONES_ARE_SAMPLE } from "@/lib/zones";
import DashboardView from "./DashboardView";

const VERDICT_COLOR: Record<Verdict, string> = { suitable: "#1864ab", unsuitable: "#b42318", unknown: "#6b7280" };
const VERDICT_GLYPH: Record<Verdict, string> = { suitable: "✓", unsuitable: "✕", unknown: "?" };

export default function HomeView() {
  const env = useEnvData();
  const boundary = useApi<BoundaryData>("/api/boundary");
  const farmland = useApi<FarmlandData>("/api/farmland");
  const geo = useGeolocation();
  const [layers, setLayers] = useState({ zones: true, farmland: true, wind: true, hotspots: true });
  const conditions = useApi<ZoneCondition[]>("/api/zone-conditions");
  const now = useNow();
  const [marks, setMarks] = useLocalStore<Record<string, string>>("burnwise-burn-marks", {});
  const [log, setLog] = useLocalStore<BurnLog>(BURN_LOG_KEY, EMPTY_LOG);
  const [doneNotice, setDoneNotice] = useState<string | null>(null);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [focus, setFocus] = useState<{ lat: number; lon: number; seq: number } | null>(null);
  const evals = useMemo(() => {
    const byId = new Map((conditions.result?.data ?? []).map((c) => [c.id, c]));
    return new Map(ZONES.map((z) => {
      const c = byId.get(z.id);
      return [z.id, { cond: c, ev: evaluate(z, c, isStale(c?.time, now, STALE_MS.weather)) }] as const;
    }));
  }, [conditions.result, now]);
  const pins = useMemo(() => ZONES.map((z) => {
    const v: Verdict = evals.get(z.id)?.ev.verdict ?? "unknown";
    return { id: z.id, name: z.name, lat: z.lat, lon: z.lon, color: VERDICT_COLOR[v], glyph: VERDICT_GLYPH[v], marked: Boolean(marks[z.id]) };
  }), [evals, marks]);
  const counts = useMemo(() => {
    const c: Record<Verdict, number> = { suitable: 0, unsuitable: 0, unknown: 0 };
    evals.forEach((e) => { c[e.ev.verdict]++; });
    return c;
  }, [evals]);
  const selected = ZONES.find((z) => z.id === selectedId) ?? null;
  const near = geo.pos ? nearestZone(geo.pos) : null;
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
            zones={layers.zones ? pins : undefined}
            onZoneSelect={setSelectedId}
            focus={focus}
            showFarmland={layers.farmland}
            showWind={layers.wind}
            showHotspots={layers.hotspots}
          />
          <div className="hero-chips" role="group" aria-label="ชั้นข้อมูลบนแผนที่">
            <button type="button" className="chip glass" aria-pressed={layers.zones} onClick={() => toggle("zones")}>แปลงเผา</button>
            <button type="button" className="chip glass" aria-pressed={layers.farmland} onClick={() => toggle("farmland")}>พื้นที่เกษตร</button>
            <button type="button" className="chip glass" aria-pressed={layers.wind} onClick={() => toggle("wind")}>ลม</button>
            <button type="button" className="chip glass" aria-pressed={layers.hotspots} onClick={() => toggle("hotspots")}>จุดความร้อน</button>
          </div>
          <button type="button" className="locate-btn glass" onClick={geo.locate} disabled={geo.status === "asking"} aria-label="ใช้ตำแหน่งปัจจุบันของฉัน (GPS)">
            <LocateFixed size={24} strokeWidth={1.75} aria-hidden="true" />
          </button>
          {selected && (
            <ZoneSheet
              key={selected.id}
              zone={selected}
              evaluation={evals.get(selected.id)!.ev}
              time={evals.get(selected.id)?.cond?.time}
              markedAt={marks[selected.id]}
              onToggleMark={() => {
                const next = { ...marks };
                if (next[selected.id]) delete next[selected.id]; else next[selected.id] = new Date().toISOString();
                setMarks(next);
              }}
              onComplete={({ doneAt, note, photo }) => {
                const z = selected;
                const record = { id: `${z.id}-${Date.now()}`, zoneId: z.id, zoneName: z.name, rai: z.rai, material: z.material, markedAt: marks[z.id], doneAt, note, photo, verdictAtDone: VERDICT_TEXT[evals.get(z.id)?.ev.verdict ?? "unknown"], sample: ZONES_ARE_SAMPLE };
                if (!setLog({ records: [record, ...log.records] })) return "บันทึกไม่ได้ พื้นที่เก็บข้อมูลในเครื่องเต็มหรือถูกปิดไว้ ลองลบรายการเก่าหรือไม่แนบรูป";
                const next = { ...marks }; delete next[z.id]; setMarks(next);
                setSelectedId(null);
                setDoneNotice(z.name);
                return null;
              }}
              onClose={() => setSelectedId(null)}
            />
          )}
          {!selected && <div className="hero-info glass" role="status" aria-live="polite">
            {doneNotice && <p><strong>บันทึก {doneNotice} ว่าเผาเสร็จแล้ว</strong> · <Link href="/completed" className="link-btn">ดูรายการ</Link> <button type="button" className="link-btn" onClick={() => setDoneNotice(null)}>ปิด</button></p>}
            {near && (
              <p>แปลงใกล้คุณ: <button type="button" className="link-btn" onClick={() => { setSelectedId(near.zone.id); setFocus({ lat: near.zone.lat, lon: near.zone.lon, seq: Date.now() }); }}>{near.zone.name} ({near.km < 1 ? `${Math.round(near.km * 1000)} ม.` : `${near.km.toFixed(1)} กม.`})</button></p>
            )}
            {geo.status !== "ok" && geo.status !== "idle" && <p role="alert">{GEO_MESSAGE[geo.status]}</p>}
            {layers.zones && conditions.result?.status === "ok" && (
              <p className="counts"><span><span className="dot" style={{ background: VERDICT_COLOR.suitable }} />เหมาะสม {counts.suitable}</span><span><span className="dot" style={{ background: VERDICT_COLOR.unsuitable }} />ไม่เหมาะสม {counts.unsuitable}</span><span><span className="dot" style={{ background: VERDICT_COLOR.unknown }} />ตรวจไม่ได้ {counts.unknown}</span></p>
            )}
            {layers.zones && conditions.loading && !conditions.result && <p>กำลังตรวจสภาพแต่ละจุด…</p>}
            {layers.zones && (conditions.networkError || conditions.result?.status === "error") && <p>ตรวจสภาพไม่ได้ <button type="button" className="link-btn" onClick={conditions.refresh}>ลองใหม่</button></p>}
            {(farmland.networkError || fl?.status === "error") && <p>โหลดพื้นที่เกษตรไม่ได้ <button type="button" className="link-btn" onClick={farmland.refresh}>ลองใหม่</button></p>}
            {layers.zones && (ZONES_ARE_SAMPLE || CRITERIA_ARE_SAMPLE) && <p className="fine">ข้อมูลตัวอย่าง ไม่ใช่การอนุญาตให้เผา</p>}
          </div>}
        </div>
        <a href="#dashboard" className="scroll-cue">เลื่อนลงดูแดชบอร์ด <ChevronDown size={20} strokeWidth={1.75} aria-hidden="true" /></a>
      </section>

      <section id="dashboard" className="container" aria-label="แดชบอร์ด">
        <DashboardView env={env} />
      </section>
    </>
  );
}
