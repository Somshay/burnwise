"use client";
import dynamic from "next/dynamic";
import type { MapProps } from "./PaiMap";

const PaiMap = dynamic(() => import("./PaiMap"), {
  ssr: false,
  loading: () => <div className="map-box state" role="status">กำลังโหลดแผนที่…</div>,
});

export default function PaiMapLazy(props: MapProps) {
  return <PaiMap {...props} />;
}
