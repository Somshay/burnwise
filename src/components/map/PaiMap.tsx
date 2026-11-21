"use client";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import { useEffect, useState } from "react";
import { Circle, CircleMarker, GeoJSON, MapContainer, Marker, Polygon, Popup, TileLayer, ZoomControl, useMap, useMapEvents } from "react-leaflet";
import { PAI_CENTER } from "@/lib/config";
import { formatThaiDateTime } from "@/lib/format";
import ZoneCluster, { type ZonePin } from "./ZoneCluster";
import type { Hotspot } from "@/lib/types";

export type MapProps = {
  boundary?: GeoJSON.GeoJsonObject;
  hotspots?: Hotspot[];
  wind?: { speed: number; direction: number };
  showWind?: boolean;
  showHotspots?: boolean;
  picked?: { lat: number; lon: number } | null;
  onPick?: (p: { lat: number; lon: number }) => void;
  sector?: { origin: { lat: number; lon: number }; windFrom: number } | null;
  tall?: boolean;
  user?: { lat: number; lon: number; accuracy: number } | null;
  zones?: ZonePin[];
  onZoneSelect?: (id: string) => void;
  focus?: { lat: number; lon: number; seq: number } | null;
  fill?: boolean; // fill the parent height (single-page hero map)
  farmland?: GeoJSON.GeoJsonObject;
  showFarmland?: boolean;
  label: string;
};

function ClickHandler({ onPick }: { onPick?: MapProps["onPick"] }) {
  useMapEvents({ click: (e) => onPick?.({ lat: e.latlng.lat, lon: e.latlng.lng }) });
  return null;
}

function FlyToUser({ user }: { user?: MapProps["user"] }) {
  const map = useMap();
  const lat = user?.lat, lon = user?.lon;
  useEffect(() => {
    if (lat !== undefined && lon !== undefined) map.flyTo([lat, lon], Math.max(map.getZoom(), 15), { duration: 1 });
  }, [map, lat, lon]);
  return null;
}

function FlyToFocus({ focus }: { focus?: MapProps["focus"] }) {
  const map = useMap();
  const seq = focus?.seq, lat = focus?.lat, lon = focus?.lon;
  useEffect(() => {
    if (seq !== undefined && lat !== undefined && lon !== undefined) map.flyTo([lat, lon], 17, { duration: 1 });
  }, [map, seq, lat, lon]);
  return null;
}

function windIcon(dir: number) {
  // Wind blows FROM `dir`, so the arrow points toward dir+180.
  const rot = (dir + 180) % 360;
  return L.divIcon({
    className: "wind-arrow",
    iconSize: [64, 64],
    iconAnchor: [32, 32],
    html: `<svg width="64" height="64" viewBox="0 0 64 64" style="transform:rotate(${rot}deg)" aria-hidden="true"><circle cx="32" cy="32" r="30" fill="rgba(24,100,171,.18)" stroke="#1864ab" stroke-width="1.5"/><path d="M32 10 L42 30 H35 V54 H29 V30 H22 Z" fill="#1864ab" stroke="#fff" stroke-width="1.5" stroke-linejoin="round"/></svg>`,
  });
}

/** Sector pointing downwind. Fixed 3 km length: a direction illustration, NOT a smoke model. */
export function downwindPolygon(o: { lat: number; lon: number }, windFrom: number): [number, number][] {
  const bearing = (windFrom + 180) % 360;
  const km = 3;
  const pts: [number, number][] = [[o.lat, o.lon]];
  for (let a = -20; a <= 20; a += 5) {
    const b = ((bearing + a) * Math.PI) / 180;
    const dLat = (km * Math.cos(b)) / 111;
    const dLon = (km * Math.sin(b)) / (111 * Math.cos((o.lat * Math.PI) / 180));
    pts.push([o.lat + dLat, o.lon + dLon]);
  }
  return pts;
}

/**
 * Leaflet keeps state on its DOM node, so re-running effects on the same node (React dev double-mount,
 * Cache Components re-activating a hidden page) throws "Map container is being reused".
 * We mount the map only while this component is active, on a fresh node each time (new key).
 */
function useFreshMountKey(): number {
  const [key, setKey] = useState(0);
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setKey((k) => k + 1);
    return () => setKey(0);
  }, []);
  return key;
}

export default function PaiMap(p: MapProps) {
  const mountKey = useFreshMountKey();
  return (
    <div className={`map-box${p.tall ? " tall" : ""}${p.fill ? " fill" : ""}`} role="region" aria-label={p.label}>
      {mountKey > 0 && <MapContainer key={mountKey} center={[PAI_CENTER.lat, PAI_CENTER.lon]} zoom={11} style={{ height: "100%", width: "100%" }} scrollWheelZoom={false} zoomControl={false} preferCanvas>
        <TileLayer attribution='&copy; ผู้ร่วมจัดทำ <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>' url="https://tile.openstreetmap.org/{z}/{x}/{y}.png" />
        <ZoomControl position="bottomright" />
        {p.farmland && p.showFarmland !== false && (
          <GeoJSON data={p.farmland} style={{ color: "#b45309", weight: 1.5, fillColor: "#f59e0b", fillOpacity: 0.35 }} onEachFeature={(f, layer) => layer.bindPopup(`พื้นที่เกษตร (ข้อมูลแผนที่ OSM)<br/>ประเภท: ${f.properties?.landuse || "ไม่ระบุ"}${f.properties?.crop ? `<br/>พืช: ${f.properties.crop}` : ""}<br/>ไม่ใช่ทะเบียนแปลงทางการ`)} />
        )}
        {p.boundary && <GeoJSON data={p.boundary} style={{ color: "#c2410c", weight: 2.5, fillOpacity: 0.05 }} />}
        {p.showHotspots !== false && p.hotspots?.map((h, i) => (
          <CircleMarker key={i} center={[h.lat, h.lon]} radius={8} pathOptions={{ color: "#fff", weight: 2, fillColor: "#e8590c", fillOpacity: 0.95 }}>
            <Popup>จุดความร้อน (ดาวเทียม {h.satellite})<br />ตรวจพบ: {formatThaiDateTime(h.acquiredAt)}<br />ความเชื่อมั่น: {h.confidence || "ไม่ระบุ"}</Popup>
          </CircleMarker>
        ))}
        {p.showWind !== false && p.wind && (
          <Marker position={[PAI_CENTER.lat, PAI_CENTER.lon]} icon={windIcon(p.wind.direction)} keyboard={false} interactive={false} zIndexOffset={-1000} />
        )}
        {p.sector && <Polygon positions={downwindPolygon(p.sector.origin, p.sector.windFrom)} pathOptions={{ color: "#1864ab", weight: 2, dashArray: "6 4", fillOpacity: 0.2 }} />}
        {p.picked && <CircleMarker center={[p.picked.lat, p.picked.lon]} radius={9} pathOptions={{ color: "#fff", weight: 3, fillColor: "#1864ab", fillOpacity: 1 }} />}
        {p.user && (
          <>
            <Circle center={[p.user.lat, p.user.lon]} radius={p.user.accuracy} pathOptions={{ color: "#1864ab", weight: 1, fillColor: "#1864ab", fillOpacity: 0.12 }} />
            <CircleMarker center={[p.user.lat, p.user.lon]} radius={8} pathOptions={{ color: "#fff", weight: 3, fillColor: "#1864ab", fillOpacity: 1 }}>
              <Popup>ตำแหน่งของคุณ<br />{p.user.lat.toFixed(5)}, {p.user.lon.toFixed(5)}<br />ความแม่นยำ ± {Math.round(p.user.accuracy)} ม.</Popup>
            </CircleMarker>
          </>
        )}
        {p.zones && <ZoneCluster zones={p.zones} onSelect={p.onZoneSelect} />}
        <FlyToUser user={p.user} />
        <FlyToFocus focus={p.focus} />
        <ClickHandler onPick={p.onPick} />
      </MapContainer>}
    </div>
  );
}
