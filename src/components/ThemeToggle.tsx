"use client";
import { Moon, Sun, SunMoon } from "lucide-react";
import { useTheme, type ThemePref } from "@/lib/theme";

const ORDER: ThemePref[] = ["light", "dark", "system"];
const LABEL: Record<ThemePref, string> = { light: "โหมดสว่าง", dark: "โหมดมืด", system: "ตามระบบ" };

export default function ThemeToggle() {
  const [pref, setPref] = useTheme();
  const next = ORDER[(ORDER.indexOf(pref) + 1) % ORDER.length];
  const Icon = pref === "light" ? Sun : pref === "dark" ? Moon : SunMoon;
  return (
    <button type="button" className="icon-btn" data-tip={`ธีม: ${LABEL[pref]}`} aria-label={`สลับธีม ตอนนี้: ${LABEL[pref]} กดเพื่อเปลี่ยนเป็น ${LABEL[next]}`} onClick={() => setPref(next)}>
      <Icon size={22} strokeWidth={1.75} aria-hidden="true" />
    </button>
  );
}
