import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  // Let phones on the same Wi-Fi load dev assets/HMR from this machine's LAN IP.
  allowedDevOrigins: ["192.168.*.*", "10.*.*.*", "*.local"],
  cacheComponents: true,
  partialPrefetching: true,
};

export default nextConfig;
