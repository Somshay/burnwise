import type { ReactNode } from "react";

type Props = { icon: ReactNode; title: string; value: ReactNode; unit?: string };

export default function MetricCard({ icon, title, value, unit }: Props) {
  return (
    <article className="panel glass metric" aria-label={title}>
      <h3 className="metric-head">{icon}<span>{title}</span></h3>
      <div className="metric-value">{value}{unit && <small>{unit}</small>}</div>
    </article>
  );
}
