import { ShieldAlert } from "lucide-react";

export default function NotPersistedNotice({ what }: { what: string }) {
  return (
    <div className="state warn" role="status" aria-live="polite">
      <ShieldAlert size={22} strokeWidth={1.75} aria-hidden="true" />
      <div>
        <strong>ข้อมูลนี้ยังไม่ถูกส่งหรือบันทึกจริง</strong>
        <p>{what} ยังไม่มีระบบหลังบ้านรองรับ จึงไม่มีการส่งถึงหน่วยงาน ไม่มีการบันทึก และไม่มีการอนุมัติใด ๆ หากเป็นเหตุเร่งด่วนให้ติดต่อหน่วยงานในพื้นที่โดยตรง (โทร 191 / 199)</p>
      </div>
    </div>
  );
}
