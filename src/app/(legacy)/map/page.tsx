import type { Metadata } from "next";
import MapView from "@/components/views/MapView";

export const metadata: Metadata = { title: "แผนที่" };

export default function Page() {
  return <MapView />;
}
