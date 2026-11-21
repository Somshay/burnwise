import type { Metadata } from "next";
import { IBM_Plex_Sans_Thai } from "next/font/google";
import "./globals.css";
import AppHeader from "@/components/AppHeader";

const thai = IBM_Plex_Sans_Thai({
  variable: "--font-thai",
  subsets: ["thai", "latin"],
  weight: ["400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: { default: "BurnWise — ระบบจัดการการเผาในภาคเกษตร", template: "%s · BurnWise" },
  description: "ระบบจัดการการเผาในภาคเกษตร พื้นที่ต้นแบบอำเภอปาย จังหวัดแม่ฮ่องสอน",
};

const themeScript = `try{var t=localStorage.getItem('burnwise-theme');var d=t==='dark'||(t!=='light'&&matchMedia('(prefers-color-scheme: dark)').matches);document.documentElement.dataset.theme=d?'dark':'light';}catch(e){}`;

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="th" className={thai.variable} suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
      </head>
      <body>
        <a className="skip-link" href="#main">ข้ามไปยังเนื้อหาหลัก</a>
        <AppHeader />
        <main id="main" tabIndex={-1}>{children}</main>
      </body>
    </html>
  );
}
