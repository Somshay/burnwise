import { TIMEZONE } from "./config";

export function formatThaiDateTime(iso: string | undefined): string {
  if (!iso) return "ไม่ทราบเวลา";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "ไม่ทราบเวลา";
  return new Intl.DateTimeFormat("th-TH", {
    timeZone: TIMEZONE,
    dateStyle: "medium",
    timeStyle: "short",
  }).format(d);
}

const COMPASS = ["เหนือ", "ตะวันออกเฉียงเหนือ", "ตะวันออก", "ตะวันออกเฉียงใต้", "ใต้", "ตะวันตกเฉียงใต้", "ตะวันตก", "ตะวันตกเฉียงเหนือ"];

/** Direction the wind blows FROM, in Thai. */
export function compassThai(deg: number): string {
  return COMPASS[Math.round((((deg % 360) + 360) % 360) / 45) % 8];
}

export function formatNumber(n: number, digits = 0): string {
  return new Intl.NumberFormat("th-TH", {
    maximumFractionDigits: digits,
    minimumFractionDigits: digits,
  }).format(n);
}
