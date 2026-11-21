"use client";
import { Check, CircleHelp, Flame, Info, X } from "lucide-react";
import { useState } from "react";
import { resizeImage } from "@/lib/burnLog";
import { CRITERIA_ARE_SAMPLE, CRITERIA_NOTE } from "@/lib/criteria";
import { VERDICT_TEXT, type CheckStatus, type Evaluation } from "@/lib/evaluate";
import { formatNumber, formatThaiDateTime } from "@/lib/format";
import { ZONES_ARE_SAMPLE, type BurnZone } from "@/lib/zones";

type Props = {
  zone: BurnZone;
  evaluation: Evaluation;
  time?: string;
  markedAt?: string;
  onToggleMark: () => void;
  /** Returns an error message, or null when saved. */
  onComplete: (d: { doneAt: string; note: string; photo?: string }) => string | null;
  onClose: () => void;
};

const ICON: Record<CheckStatus, React.ReactNode> = {
  pass: <Check size={16} strokeWidth={2} aria-label="ผ่าน" />,
  fail: <X size={16} strokeWidth={2} aria-label="ไม่ผ่าน" />,
  unknown: <CircleHelp size={16} strokeWidth={1.75} aria-label="ไม่มีข้อมูล" />,
  info: <Info size={16} strokeWidth={1.75} aria-label="ข้อมูลประกอบ" />,
};

function nowLocal(): string {
  const d = new Date();
  d.setMinutes(d.getMinutes() - d.getTimezoneOffset());
  return d.toISOString().slice(0, 16);
}

export default function ZoneSheet({ zone, evaluation: ev, time, markedAt, onToggleMark, onComplete, onClose }: Props) {
  const [completing, setCompleting] = useState(false);
  const [doneAt, setDoneAt] = useState("");
  const [note, setNote] = useState("");
  const [photo, setPhoto] = useState<string | undefined>();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  async function onFile(f: File | undefined) {
    setError("");
    if (!f) return setPhoto(undefined);
    setBusy(true);
    try { setPhoto(await resizeImage(f)); } catch { setError("อ่านรูปไม่ได้ ลองเลือกรูปอื่น"); }
    setBusy(false);
  }
  function submit(e: React.FormEvent) {
    e.preventDefault();
    const err = onComplete({ doneAt: new Date(doneAt).toISOString(), note: note.trim(), photo });
    if (err) setError(err);
  }

  return (
    <div className="zone-sheet glass" role="dialog" aria-label={`สภาพ ณ ${zone.name}`}>
      <div className="zone-sheet-head">
        <strong>{zone.name}</strong>
        {ZONES_ARE_SAMPLE && <span className="badge sample">ข้อมูลตัวอย่าง</span>}
        <button type="button" className="icon-btn" onClick={onClose} aria-label="ปิดรายละเอียด" style={{ marginLeft: "auto", width: 44, height: 44 }}><X size={20} strokeWidth={1.75} aria-hidden="true" /></button>
      </div>
      <p className={`verdict ${ev.verdict}`} role="status"><strong>{VERDICT_TEXT[ev.verdict]}</strong> · {ev.reason}</p>
      {ev.verdict === "unsuitable" && !markedAt && <p role="alert" className="state warn" style={{ margin: "6px 0" }}>ตอนนี้เงื่อนไขไม่เหมาะสม ทบทวนก่อนตัดสินใจเผา</p>}
      <button type="button" className={`btn ${markedAt ? "" : "primary"}`} onClick={onToggleMark} aria-pressed={Boolean(markedAt)} style={{ width: "100%" }}>
        <Flame size={18} strokeWidth={1.75} aria-hidden="true" />{markedAt ? "ยกเลิกการบันทึกว่าจะเผา" : "ฉันจะเผาบริเวณนี้"}
      </button>
      <p className="muted" style={{ fontSize: "0.8rem", margin: "6px 0 0" }}>
        {markedAt ? `บันทึกไว้เมื่อ ${formatThaiDateTime(markedAt)} ` : ""}บันทึกในเครื่องคุณเท่านั้น ยังไม่ได้แจ้งหน่วยงานหรือผู้อื่น และไม่ใช่การขออนุญาต
      </p>
      {markedAt && !completing && (
        <button type="button" className="btn" onClick={() => { setCompleting(true); setDoneAt(nowLocal()); }} style={{ width: "100%", marginTop: 8 }}>
          <Check size={18} strokeWidth={1.75} aria-hidden="true" />เผาเสร็จแล้ว
        </button>
      )}
      {completing && (
        <form onSubmit={submit} className="done-form" aria-label="บันทึกว่าเผาเสร็จ">
          <div className="field">
            <label htmlFor="done-at">เวลาที่เผาเสร็จ</label>
            <div className="row">
              <input id="done-at" type="datetime-local" required value={doneAt} onChange={(e) => setDoneAt(e.target.value)} />
              <button type="button" className="btn" onClick={() => setDoneAt(nowLocal())}>ตอนนี้</button>
            </div>
          </div>
          <div className="field">
            <label htmlFor="done-note">หมายเหตุ (ไม่บังคับ)</label>
            <textarea id="done-note" value={note} onChange={(e) => setNote(e.target.value)} maxLength={300} />
          </div>
          <div className="field">
            <label htmlFor="done-photo">รูปถ่าย (ไม่บังคับ)</label>
            <input id="done-photo" type="file" accept="image/*" onChange={(e) => onFile(e.target.files?.[0])} />
            <span className="hint muted">ย่อรูปแล้วเก็บในเครื่องนี้เท่านั้น ไม่ได้อัปโหลด</span>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            {photo && <img src={photo} alt="ตัวอย่างรูปที่แนบ" style={{ maxWidth: 160, borderRadius: 10 }} />}
          </div>
          {error && <p role="alert" className="state error" style={{ margin: 0 }}>{error}</p>}
          <div className="actions">
            <button type="submit" className="btn primary" disabled={busy}>บันทึกเผาเสร็จสิ้น</button>
            <button type="button" className="btn" onClick={() => { setCompleting(false); setError(""); }}>ยกเลิก</button>
          </div>
        </form>
      )}
      <p className="muted" style={{ margin: "6px 0", fontSize: "0.85rem" }}>{formatNumber(zone.rai, 1)} ไร่ · {zone.material}{time ? ` · ข้อมูล ${formatThaiDateTime(time)}` : ""}</p>
      <ul className="checks">
        {ev.checks.map((k) => (
          <li key={k.id} className={`check-row ${k.status}`}>
            <span className="check-ico">{ICON[k.status]}</span>
            <span className="check-main"><b>{k.label}</b> {k.value}<small>เกณฑ์: {k.rule}</small></span>
          </li>
        ))}
      </ul>
      {CRITERIA_ARE_SAMPLE && <p className="muted" style={{ fontSize: "0.8rem", margin: "6px 0" }}>{CRITERIA_NOTE} ค่าลม/ฝุ่น/ความกดอากาศมาจากแบบจำลอง ไม่ใช่เครื่องวัดในพื้นที่</p>}
    </div>
  );
}
