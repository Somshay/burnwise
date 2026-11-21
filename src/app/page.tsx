import type { Metadata } from "next";
import HomeView from "@/components/views/HomeView";

export const metadata: Metadata = { title: "แผนที่และแดชบอร์ด" };

export default function Page() {
  return <HomeView />;
}
