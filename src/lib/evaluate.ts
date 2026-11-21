import { RULES, ruleText, type RuleId } from "./criteria";
import { compassThai, formatNumber } from "./format";
import type { ZoneCondition } from "./types";
import type { BurnZone } from "./zones";

export type Verdict = "suitable" | "unsuitable" | "unknown";
export type CheckStatus = "pass" | "fail" | "unknown" | "info";
export type Check = { id: string; label: string; value: string; rule: string; status: CheckStatus; note?: string; plain?: string };
export type Evaluation = { verdict: Verdict; checks: Check[]; reason: string };

export const VERDICT_TEXT: Record<Verdict, string> = {
  suitable: "เงื่อนไขเหมาะสม",
  unsuitable: "เงื่อนไขไม่เหมาะสม",
  unknown: "ตรวจเงื่อนไขไม่ได้",
};

function inSector(deg: number, from: number, to: number): boolean {
  const d = ((deg % 360) + 360) % 360, a = ((from % 360) + 360) % 360, b = ((to % 360) + 360) % 360;
  return a <= b ? d >= a && d <= b : d >= a || d <= b;
}

export function evaluate(zone: BurnZone, c: ZoneCondition | undefined, stale: boolean): Evaluation {
  if (!c) return { verdict: "unknown", checks: [], reason: "ยังไม่มีข้อมูลของจุดนี้" };

  const values: Record<RuleId, number | null> = { windSpeed: c.windSpeed, humidity: c.humidity, pm25: c.pm25, pressure: c.pressureMsl };
  const checks: Check[] = RULES.map((r) => {
    const v = values[r.id];
    if (v === null || !Number.isFinite(v)) return { id: r.id, label: r.label, value: "ไม่มีข้อมูล", rule: ruleText(r), status: "unknown" as const, note: r.why };
    const tooLow = r.min !== undefined && v < r.min;
    const tooHigh = r.max !== undefined && v > r.max;
    const plain = tooLow ? r.low : tooHigh ? r.high : undefined;
    return { id: r.id, label: r.label, value: `${formatNumber(v, 1)} ${r.unit}`, rule: ruleText(r), status: tooLow || tooHigh ? ("fail" as const) : ("pass" as const), note: r.why, plain };
  });

  const downwind = (c.windDirection + 180) % 360;
  const dirValue = `ลมพัดมาจาก${compassThai(c.windDirection)} ควันไปทาง${compassThai(downwind)}`;
  if (zone.avoid) {
    const bad = inSector(downwind, zone.avoid.fromDeg, zone.avoid.toDeg);
    checks.push({ id: "windDirection", label: "ทิศทางลม", value: dirValue, rule: `ควันไม่ควรไปทาง${zone.avoid.label}`, status: bad ? "fail" : "pass", note: bad ? `ควันอาจพัดไปทาง${zone.avoid.label}` : undefined, plain: bad ? `ควันอาจพัดไปทาง${zone.avoid.label}` : undefined });
  } else {
    checks.push({ id: "windDirection", label: "ทิศทางลม", value: dirValue, rule: "ยังไม่ได้กำหนดทิศที่ต้องหลีกเลี่ยง (ไม่นับเป็นเงื่อนไข)", status: "info" });
  }

  const fails = checks.filter((k) => k.status === "fail");
  if (fails.length) return { verdict: "unsuitable", checks, reason: fails.slice(0, 2).map((k) => k.plain ?? k.label).join(" · ") };
  const unknowns = checks.filter((k) => k.status === "unknown");
  if (unknowns.length) return { verdict: "unknown", checks, reason: "ข้อมูลยังไม่ครบ" };
  if (stale) return { verdict: "unknown", checks, reason: "ข้อมูลเก่าเกินไป" };
  return { verdict: "suitable", checks, reason: "ทุกอย่างอยู่ในเกณฑ์ที่ตั้งไว้" };
}
