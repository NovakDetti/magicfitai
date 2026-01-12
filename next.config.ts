import type { NextConfig } from "next";

const r2PublicUrl = process.env.R2_PUBLIC_URL;
let r2Hostname: string | undefined;

if (r2PublicUrl) {
  try {
    r2Hostname = new URL(r2PublicUrl).hostname;
  } catch {
    r2Hostname = undefined;
  }
}

const nextConfig: NextConfig = {
  images: {
    domains: r2Hostname ? [r2Hostname] : [],
  },
};

export default nextConfig;
