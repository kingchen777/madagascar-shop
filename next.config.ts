import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";

const withNextIntl = createNextIntlPlugin("./src/lib/i18n.ts");

const nextConfig: NextConfig = {
  images: {
    formats: ["image/avif", "image/webp"],
    remotePatterns: [
      { protocol: "https", hostname: "**.supabase.co" },
      { protocol: "https", hostname: "**.alicdn.com" },
      { protocol: "https", hostname: "img.taobao.com" },
      { protocol: "https", hostname: "**.taobao.com" },
      { protocol: "https", hostname: "**.jd.com" },
      { protocol: "https", hostname: "**.360buyimg.com" },
      { protocol: "https", hostname: "**.pinduoduo.com" },
      { protocol: "https", hostname: "**.yangkeduo.com" },
      { protocol: "https", hostname: "**.1688.com" },
      { protocol: "https", hostname: "cbu01.alicdn.com" },
      { protocol: "https", hostname: "img.alicdn.com" },
      { protocol: "https", hostname: "images.unsplash.com" },
      { protocol: "https", hostname: "cdn.jsdelivr.net" },
    ],
  },
};

export default withNextIntl(nextConfig);
