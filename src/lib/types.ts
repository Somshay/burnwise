export type DataKind = "observed" | "model" | "satellite" | "sample";

export type SourceInfo = {
  name: string;
  url?: string;
  kind: DataKind;
};

export type ApiResult<T> = {
  status: "ok" | "not_configured" | "error";
  data?: T;
  message?: string;
  source: SourceInfo;
  fetchedAt: string;
};

export type WeatherData = {
  current: {
    time: string; // ISO with offset
    temperature: number; // °C
    windSpeed: number; // km/h
    windDirection: number; // degrees, direction wind comes FROM
    humidity: number; // %
    pressure: number; // hPa
  };
  hourly: { time: string; windSpeed: number; windDirection: number }[];
};

export type AirData = {
  time: string;
  pm25: number | null; // µg/m³
};

export type Hotspot = {
  lat: number;
  lon: number;
  acquiredAt: string; // ISO UTC
  confidence: string;
  satellite: string;
};

export type HotspotData = {
  hotspots: Hotspot[];
  windowNote: string;
};

export type Station = {
  id: string;
  name: string;
  lat: number;
  lon: number;
  observedAt: string;
  pm25?: number;
  temperature?: number;
  humidity?: number;
};

export type StationData = { stations: Station[] };

export type BoundaryData = { geojson: GeoJSON.GeoJsonObject; name: string };

export type FarmlandData = {
  geojson: GeoJSON.FeatureCollection;
  count: number;
  truncated: boolean;
};

export type ZoneCondition = {
  id: string;
  time: string;
  windSpeed: number; // km/h
  windDirection: number; // degrees, wind comes FROM
  humidity: number; // %
  pressureMsl: number; // hPa, mean sea level
  pm25: number | null; // µg/m³
};
