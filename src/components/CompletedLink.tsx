"use client";
import Link from "next/link";
import { ClipboardCheck } from "lucide-react";
import { BURN_LOG_KEY, EMPTY_LOG, type BurnLog } from "@/lib/burnLog";
import { useLocalStore } from "@/lib/useLocalStore";

export default function CompletedLink() {
  const [log] = useLocalStore<BurnLog>(BURN_LOG_KEY, EMPTY_LOG);
  const n = log.records.length;
  return (
    <Link href="/completed" className="icon-btn" data-tip="รายการเผาเสร็จสิ้น" aria-label={`รายการเผาเสร็จสิ้น ${n} รายการ`}>
      <ClipboardCheck size={22} strokeWidth={1.75} aria-hidden="true" />
      {n > 0 && <span className="count-badge" aria-hidden="true">{n}</span>}
    </Link>
  );
}
