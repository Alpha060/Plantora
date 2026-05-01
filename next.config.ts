import type { NextConfig } from "next";

import os from "os";

// Helper to get local IP addresses dynamically
function getLocalIpAddresses() {
  const interfaces = os.networkInterfaces();
  const addresses: string[] = [];
  for (const k in interfaces) {
    for (const k2 in interfaces[k]!) {
      const address = interfaces[k]![k2];
      if (address.family === "IPv4" && !address.internal) {
        addresses.push(address.address);
      }
    }
  }
  return addresses;
}

const nextConfig: NextConfig = {
  // @ts-ignore - Some Next.js versions have this outside types
  allowedDevOrigins: ["localhost", "192.168.1.6", ...getLocalIpAddresses(), ...getLocalIpAddresses().map(ip => `${ip}:3000`)],
  images: {
    formats: ["image/avif", "image/webp"],
    deviceSizes: [640, 750, 828, 1080, 1200],
    imageSizes: [16, 32, 48, 64, 96, 128, 256],
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },
      {
        protocol: "https",
        hostname: "plus.unsplash.com",
      },
      {
        protocol: "https",
        hostname: "ntbbncljuwpnglnfveze.supabase.co",
      },
      {
        protocol: "https",
        hostname: "lh3.googleusercontent.com",
      },
    ],
  },
  // ── Security Headers ───────────────────────────────────────────────
  async headers() {
    return [
      {
        // Apply to all routes
        source: "/(.*)",
        headers: [
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "X-Frame-Options", value: "DENY" },
          {
            key: "Referrer-Policy",
            value: "strict-origin-when-cross-origin",
          },
          { key: "X-DNS-Prefetch-Control", value: "on" },
          {
            key: "Permissions-Policy",
            value:
              "camera=(), microphone=(), geolocation=(self), payment=(self)",
          },
          {
            key: "Strict-Transport-Security",
            value: "max-age=63072000; includeSubDomains; preload",
          },
        ],
      },
    ];
  },
};

export default nextConfig;
