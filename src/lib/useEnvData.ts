"use client";
import { useCallback } from "react";
import { useApi } from "./useApi";
import type { AirData, HotspotData, StationData, WeatherData } from "./types";

export function useEnvData() {
  const weather = useApi<WeatherData>("/api/weather");
  const air = useApi<AirData>("/api/air");
  const hotspots = useApi<HotspotData>("/api/hotspots");
  const stations = useApi<StationData>("/api/stations");
  const refreshW = weather.refresh, refreshA = air.refresh, refreshH = hotspots.refresh, refreshS = stations.refresh;
  const refresh = useCallback(() => {
    refreshW(); refreshA(); refreshH(); refreshS();
  }, [refreshW, refreshA, refreshH, refreshS]);
  const loading = weather.loading || air.loading || hotspots.loading || stations.loading;
  return { weather, air, hotspots, stations, refresh, loading };
}
