import type { Metadata } from "next";
import AssessmentView from "@/components/views/AssessmentView";

export const metadata: Metadata = { title: "ประเมินความเหมาะสมในการเผา" };

export default function Page() {
  return <AssessmentView />;
}
