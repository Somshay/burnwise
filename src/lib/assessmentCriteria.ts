/**
 * Official burn-assessment criteria.
 *
 * Intentionally EMPTY: no officially confirmed thresholds have been provided.
 * When an authority publishes criteria, add them here keyed by factor id, e.g.
 *   windSpeed: { label: "...", rule: "...", source: "ประกาศ ...", effectiveFrom: "2026-02-01" }
 * The assessment page shows "ยังไม่มีเกณฑ์ที่ยืนยัน" for any factor without an entry,
 * and never outputs a verdict or maximum area on its own.
 */
export type Criterion = {
  label: string;
  rule: string;
  source: string;
  effectiveFrom: string;
};

export const CRITERIA: Partial<Record<"windSpeed" | "windDirection" | "humidity" | "pm25" | "hotspots", Criterion>> = {};
