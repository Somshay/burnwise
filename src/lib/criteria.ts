/**
 * Conditions used to judge whether a spot is "suitable" to burn right now.
 *
 * THESE ARE SAMPLE VALUES, not official criteria. Nobody authoritative has confirmed them.
 * Replace the numbers (and set CRITERIA_ARE_SAMPLE to false) only when an accountable authority
 * provides real thresholds. The result is information only, never a permission to burn.
 *
 * Wind direction is judged per zone: a zone may define an `avoid` sector in src/data/burn-zones.json
 * (downwind bearings toward a village, school, etc.). Zones without one show direction as information only.
 */
export const CRITERIA_ARE_SAMPLE = true;
export const CRITERIA_NOTE = "เกณฑ์ตัวอย่าง ยังไม่ใช่เกณฑ์ทางการ ผลนี้ไม่ใช่การอนุญาตให้เผา";

export type RuleId = "windSpeed" | "humidity" | "pm25" | "pressure";
export type Rule = { id: RuleId; label: string; unit: string; min?: number; max?: number; why: string; low?: string; high?: string };

export const RULES: Rule[] = [
  { id: "windSpeed", label: "ความเร็วลม", unit: "กม./ชม.", min: 3, max: 15, why: "ลมสงบเกินไปควันสะสม ลมแรงเกินไปไฟลามควบคุมยาก", low: "ลมนิ่งเกินไป", high: "ลมแรงเกินไป" },
  { id: "humidity", label: "ความชื้นสัมพัทธ์", unit: "%", min: 40, why: "ความชื้นต่ำไฟลามง่าย", low: "อากาศแห้งเกินไป" },
  { id: "pm25", label: "PM2.5", unit: "µg/m³", max: 37.5, why: "ฝุ่นสูงอยู่แล้ว ไม่ควรเพิ่ม", high: "ฝุ่นสูงอยู่แล้ว" },
  { id: "pressure", label: "ความกดอากาศ (ระดับน้ำทะเล)", unit: "hPa", max: 1016, why: "ความกดอากาศสูงอากาศนิ่ง ควันระบายยาก", high: "อากาศนิ่ง ควันระบายยาก" },
];

export function ruleText(r: Rule): string {
  if (r.min !== undefined && r.max !== undefined) return `${r.min}–${r.max} ${r.unit}`;
  if (r.min !== undefined) return `ตั้งแต่ ${r.min} ${r.unit} ขึ้นไป`;
  return `ไม่เกิน ${r.max} ${r.unit}`;
}
