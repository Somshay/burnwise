import type { Metadata } from "next";
import AlertsView from "@/components/views/AlertsView";

export const metadata: Metadata = { title: "การแจ้งเตือน" };

export default function Page() {
  return <AlertsView />;
}
