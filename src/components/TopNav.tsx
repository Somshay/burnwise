"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Bell, ClipboardCheck, LayoutDashboard, Map, UserRound } from "lucide-react";
import Logo from "./Logo";
import ThemeToggle from "./ThemeToggle";

const ITEMS = [
  { href: "/", label: "แดชบอร์ด", Icon: LayoutDashboard },
  { href: "/map", label: "แผนที่", Icon: Map },
  { href: "/assessment", label: "ประเมินความเหมาะสมในการเผา", Icon: ClipboardCheck },
  { href: "/alerts", label: "การแจ้งเตือน", Icon: Bell },
  { href: "/profile", label: "โปรไฟล์", Icon: UserRound },
];

export default function TopNav() {
  const path = usePathname();
  return (
    <header className="topbar glass">
      <Link href="/" className="brand" aria-label="BurnWise หน้าแรก">
        <Logo />
        <span>BurnWise</span>
      </Link>
      <nav className="nav" aria-label="เมนูหลัก">
        <ul>
          {ITEMS.map(({ href, label, Icon }) => {
            const active = href === "/" ? path === "/" : path.startsWith(href);
            return (
              <li key={href}>
                <Link href={href} aria-label={label} data-tip={label} aria-current={active ? "page" : undefined}>
                  <Icon size={22} strokeWidth={1.75} aria-hidden="true" />
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>
      <div className="spacer" />
      <ThemeToggle />
    </header>
  );
}
