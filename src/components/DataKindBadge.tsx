import type { DataKind } from "@/lib/types";

const TEXT: Record<DataKind, string> = {
  observed: "ตรวจวัดจริง",
  model: "แบบจำลอง",
  satellite: "ดาวเทียม",
  sample: "ตัวอย่าง",
};

export default function DataKindBadge({ kind }: { kind: DataKind }) {
  return <span className={`badge ${kind}`}>{TEXT[kind]}</span>;
}
