"use client";
import { Trash2 } from "lucide-react";
import { useState } from "react";
import { EmptyState } from "@/components/states/states";
import { BURN_LOG_KEY, EMPTY_LOG, type BurnLog } from "@/lib/burnLog";
import { formatNumber, formatThaiDateTime } from "@/lib/format";
import { useLocalStore } from "@/lib/useLocalStore";

export default function CompletedView() {
  const [log, setLog] = useLocalStore<BurnLog>(BURN_LOG_KEY, EMPTY_LOG);
  const [confirmId, setConfirmId] = useState<string | null>(null);
  const records = [...log.records].sort((a, b) => b.doneAt.localeCompare(a.doneAt));
  const totalRai = records.reduce((a, r) => a + r.rai, 0);

  return (
    <>
      <div className="page-head">
        <h1>รายการเผาเสร็จสิ้น</h1>
        <p>รายการที่คุณกดบันทึกว่าเผาเสร็จแล้วจากแผนที่ เก็บในเครื่องนี้เท่านั้น ไม่ได้ส่งถึงหน่วยงานหรือผู้อื่น ไม่มีการตรวจสอบหรือยืนยัน และจะหายถ้าล้างข้อมูลเบราว์เซอร์</p>
      </div>

      {records.length === 0 ? (
        <EmptyState title="ยังไม่มีรายการเผาเสร็จสิ้น">บนแผนที่ แตะแปลง กด «ฉันจะเผาบริเวณนี้» และเมื่อเผาเสร็จกด «เผาเสร็จแล้ว» รายการจะมาอยู่ที่นี่</EmptyState>
      ) : (
        <>
          <p className="muted" role="status">ทั้งหมด {records.length} รายการ · รวม {formatNumber(totalRai, 1)} ไร่</p>
          <ul className="done-list">
            {records.map((r) => (
              <li key={r.id} className="panel glass">
                <div className="done-head">
                  <strong>{r.zoneName}</strong>
                  {r.sample && <span className="badge sample">ข้อมูลตัวอย่าง</span>}
                </div>
                <p className="muted" style={{ margin: "2px 0 6px" }}>เผาเสร็จ {formatThaiDateTime(r.doneAt)}</p>
                <dl className="done-dl">
                  <dt>ขนาด</dt><dd>{formatNumber(r.rai, 1)} ไร่</dd>
                  <dt>วัสดุ</dt><dd>{r.material}</dd>
                  {r.markedAt && <><dt>บันทึกว่าจะเผา</dt><dd>{formatThaiDateTime(r.markedAt)}</dd></>}
                  <dt>เงื่อนไขตอนบันทึก</dt><dd>{r.verdictAtDone} <span className="muted">(เกณฑ์ตัวอย่าง)</span></dd>
                </dl>
                {r.note && <p style={{ margin: "6px 0" }}>{r.note}</p>}
                {/* eslint-disable-next-line @next/next/no-img-element */}
                {r.photo && <img src={r.photo} alt={`รูปถ่ายที่แนบกับ ${r.zoneName}`} className="done-photo" />}
                <div className="actions" style={{ marginTop: 8 }}>
                  {confirmId === r.id ? (
                    <>
                      <button type="button" className="btn" style={{ color: "var(--danger)" }} onClick={() => { setLog({ records: log.records.filter((x) => x.id !== r.id) }); setConfirmId(null); }}>ยืนยันลบรายการนี้</button>
                      <button type="button" className="btn" onClick={() => setConfirmId(null)}>ไม่ลบ</button>
                    </>
                  ) : (
                    <button type="button" className="btn" onClick={() => setConfirmId(r.id)}><Trash2 size={18} strokeWidth={1.75} aria-hidden="true" />ลบ</button>
                  )}
                </div>
              </li>
            ))}
          </ul>
        </>
      )}
    </>
  );
}
