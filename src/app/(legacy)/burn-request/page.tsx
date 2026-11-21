import type { Metadata } from "next";
import BurnRequestView from "@/components/views/BurnRequestView";

export const metadata: Metadata = { title: "ยื่นคำขอเผา" };

export default function Page() {
  return <BurnRequestView />;
}
