"use client";
import { useCallback, useState } from "react";

export type UserPos = { lat: number; lon: number; accuracy: number };
export type GeoStatus = "idle" | "asking" | "ok" | "denied" | "unavailable" | "insecure" | "timeout";

/** Browser GPS. Only asks when `locate()` is called from a tap. Position stays in memory, never sent anywhere. */
export function useGeolocation() {
  const [status, setStatus] = useState<GeoStatus>("idle");
  const [pos, setPos] = useState<UserPos | null>(null);

  const locate = useCallback(() => {
    if (typeof navigator === "undefined" || !navigator.geolocation) return setStatus("unavailable");
    // Browsers (iOS Safari especially) only allow GPS on HTTPS or localhost.
    if (!window.isSecureContext) return setStatus("insecure");
    setStatus("asking");
    navigator.geolocation.getCurrentPosition(
      (p) => {
        setPos({ lat: p.coords.latitude, lon: p.coords.longitude, accuracy: p.coords.accuracy });
        setStatus("ok");
      },
      (e) => setStatus(e.code === e.PERMISSION_DENIED ? "denied" : e.code === e.TIMEOUT ? "timeout" : "unavailable"),
      { enableHighAccuracy: true, timeout: 15_000, maximumAge: 30_000 },
    );
  }, []);

  return { status, pos, locate };
}

export const GEO_MESSAGE: Record<GeoStatus, string> = {
  idle: "",
  asking: "กำลังขอตำแหน่ง… โปรดกด \"อนุญาต\" ที่หน้าต่างของเบราว์เซอร์",
  ok: "",
  denied: "ไม่ได้รับอนุญาตให้ใช้ตำแหน่ง ไปที่การตั้งค่าเบราว์เซอร์/เครื่องแล้วอนุญาตตำแหน่งสำหรับเว็บนี้ จากนั้นกดอีกครั้ง",
  unavailable: "หาตำแหน่งไม่ได้ ตรวจสอบว่าเปิด GPS/บริการตำแหน่งแล้ว",
  insecure: "เบราว์เซอร์ใช้ GPS ได้เฉพาะหน้าเว็บ HTTPS (หรือ localhost) หน้านี้เปิดแบบ HTTP จึงขอตำแหน่งไม่ได้",
  timeout: "หาตำแหน่งนานเกินไป ลองออกไปที่โล่งแล้วกดอีกครั้ง",
};
