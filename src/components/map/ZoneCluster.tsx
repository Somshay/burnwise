"use client";
import L from "leaflet";
import "leaflet.markercluster";
import "leaflet.markercluster/dist/MarkerCluster.css";
import { useEffect, useRef } from "react";
import { useMap } from "react-leaflet";

export type ZonePin = { id: string; name: string; lat: number; lon: number; color: string; glyph: string; marked: boolean };

/** Groups nearby zones into large count circles; tapping a circle zooms in until single plots show. */
export default function ZoneCluster({ zones, onSelect }: { zones: ZonePin[]; onSelect?: (id: string) => void }) {
  const map = useMap();
  const onSelectRef = useRef(onSelect);
  useEffect(() => { onSelectRef.current = onSelect; }, [onSelect]);

  useEffect(() => {
    const group = L.markerClusterGroup({
      maxClusterRadius: 70,
      showCoverageOnHover: false,
      zoomToBoundsOnClick: true,
      spiderfyOnMaxZoom: true,
      iconCreateFunction: (c) => {
        const n = c.getChildCount();
        const size = Math.round(46 + Math.min(n, 30) * 1.1);
        return L.divIcon({
          html: `<div class="zc" style="width:${size}px;height:${size}px" aria-label="กลุ่ม ${n} แปลง">${n}</div>`,
          className: "zone-cluster",
          iconSize: [size, size],
        });
      },
    });
    for (const z of zones) {
      const m = L.marker([z.lat, z.lon], {
        title: `${z.name}${z.marked ? " (คุณบันทึกว่าจะเผา)" : ""}`,
        icon: L.divIcon({ className: "zone-pin", html: `<span class="${z.marked ? "marked" : ""}" style="background:${z.color}">${z.glyph}</span>`, iconSize: [26, 26] }),
      });
      m.on("click", () => onSelectRef.current?.(z.id));
      group.addLayer(m);
    }
    map.addLayer(group);
    return () => { map.removeLayer(group); };
  }, [map, zones]);

  return null;
}
