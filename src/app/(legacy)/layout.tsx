import Link from "next/link";
import { ArrowLeft } from "lucide-react";

// Secondary pages kept from the first version. They are not linked from the single-page home yet.
export default function LegacyLayout({ children }: LayoutProps<"/">) {
  return (
    <div className="container">
      <Link href="/" className="btn" style={{ marginBottom: 14 }}><ArrowLeft size={18} strokeWidth={1.75} aria-hidden="true" />กลับหน้าหลัก</Link>
      {children}
    </div>
  );
}
