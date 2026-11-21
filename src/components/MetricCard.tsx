import type { ReactNode } from "react";
import type { DataKind } from "@/lib/types";
import { formatThaiDateTime } from "@/lib/format";
import DataKindBadge from "./DataKindBadge";

type Props = {
  icon: ReactNode;
  title: string;
  value: ReactNode;
  unit?: string;
  kind: DataKind;
  source: string;
  time?: string;
  stale?: boolean;
  note?: string;
};

export default function MetricCard({ icon, title, value, unit, kind, source, time, stale, note }: Props) {
  return (
    <article className="panel glass metric" aria-label={title}>
      <h3 className="metric-head">{icon}<span>{title}</span></h3>
      <div className="metric-value">{value}{unit && <small>{unit}</small>}</div>
      <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
        <DataKindBadge kind={kind} />
        {stale && <span className="badge stale">ข้อมูลเก่า</span>}
      </div>
      {note && <div className="metric-meta">{note}</div>}
      <div className="metric-meta">แหล่งข้อมูล: {source}</div>
      <div className="metric-meta">เวลาข้อมูล: {formatThaiDateTime(time)}</div>
    </article>
  );
}
