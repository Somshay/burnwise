import { AlertTriangle, Clock, Inbox, Loader2 } from "lucide-react";
import type { ReactNode } from "react";

const P = { size: 22, strokeWidth: 1.75, "aria-hidden": true } as const;

export function LoadingState({ label = "กำลังโหลดข้อมูล…" }: { label?: string }) {
  return (
    <div className="state" role="status" aria-live="polite">
      <Loader2 {...P} />
      <p>{label}</p>
    </div>
  );
}

export function ErrorState({ title = "โหลดข้อมูลไม่สำเร็จ", children }: { title?: string; children?: ReactNode }) {
  return (
    <div className="state error" role="alert">
      <AlertTriangle {...P} />
      <div><strong>{title}</strong>{children && <p>{children}</p>}</div>
    </div>
  );
}

export function EmptyState({ title, children }: { title: string; children?: ReactNode }) {
  return (
    <div className="state info" role="status">
      <Inbox {...P} />
      <div><strong>{title}</strong>{children && <p>{children}</p>}</div>
    </div>
  );
}

export function StaleState({ children }: { children?: ReactNode }) {
  return (
    <div className="state warn" role="status">
      <Clock {...P} />
      <div><strong>ข้อมูลเก่า</strong>{children && <p>{children}</p>}</div>
    </div>
  );
}
