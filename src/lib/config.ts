export const PAI_CENTER = { lat: 19.358, lon: 98.44 } as const;

// Approximate bounding box around Pai District (west, south, east, north).
export const PAI_BBOX = { west: 98.2, south: 19.1, east: 98.7, north: 19.6 } as const;

export const TIMEZONE = "Asia/Bangkok";

// After this age a value is flagged as stale (ข้อมูลเก่า).
export const STALE_MS = {
  weather: 3 * 60 * 60 * 1000,
  air: 6 * 60 * 60 * 1000,
  hotspots: 24 * 60 * 60 * 1000,
  stations: 3 * 60 * 60 * 1000,
} as const;

export const USER_AGENT = "BurnWise/0.1";
