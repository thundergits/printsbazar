import type { NextConfig } from "next";

// Only these hosts can be loaded through next/image. A "**" wildcard would let
// anyone use the image optimizer as a free proxy for any site on the internet.
// Add more (comma-separated) with IMAGE_HOSTS if product images live elsewhere.
const imageHosts = [
  "res.cloudinary.com",
  ...(process.env.IMAGE_HOSTS?.split(",").map((h) => h.trim()).filter(Boolean) ?? []),
];

const securityHeaders = [
  { key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains" },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "X-Frame-Options", value: "SAMEORIGIN" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=(), payment=(self \"https://checkout.razorpay.com\" \"https://api.razorpay.com\")" },
];

const nextConfig: NextConfig = {
  poweredByHeader: false,
  images: {
    remotePatterns: imageHosts.map((hostname) => ({ protocol: "https", hostname })),
  },
  async headers() {
    return [
      { source: "/:path*", headers: securityHeaders },
      // Admin pages and the API must never be cached by browsers or CDNs
      { source: "/admin/:path*", headers: [{ key: "Cache-Control", value: "no-store" }] },
      { source: "/api/:path*", headers: [{ key: "Cache-Control", value: "no-store" }] },
    ];
  },
};

export default nextConfig;
