import type { Metadata } from "next";
import CompletedView from "@/components/views/CompletedView";

export const metadata: Metadata = { title: "รายการเผาเสร็จสิ้น" };

export default function Page() {
  return <CompletedView />;
}
