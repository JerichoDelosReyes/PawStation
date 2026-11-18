/** @type {import('next').NextConfig} */
const isDev = process.env.NODE_ENV !== "production";

const nextConfig = {
  reactStrictMode: true,
  compress: true,
  poweredByHeader: false, // Prevents X-Powered-By information disclosure
  allowedDevOrigins: [
    "192.168.18.217",
    "localhost",
    "127.0.0.1",
  ],
  images: {
    formats: ["image/avif", "image/webp"],
    minimumCacheTTL: 60 * 60 * 24 * 30, // 30 days
  },
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          {
            key: "X-DNS-Prefetch-Control",
            value: "on",
          },
          {
            key: "Strict-Transport-Security",
            value: "max-age=63072000; includeSubDomains; preload",
          },
          {
            key: "X-Frame-Options",
            value: "DENY",
          },
          {
            key: "X-Content-Type-Options",
            value: "nosniff",
          },
          {
            key: "Referrer-Policy",
            value: "strict-origin-when-cross-origin",
          },
          {
            key: "Permissions-Policy",
            value: "camera=(), microphone=(), geolocation=(), payment=()",
          },
          {
            key: "X-Permitted-Cross-Domain-Policies",
            value: "none",
          },
          {
            key: "Content-Security-Policy",
            value: [
              "default-src 'self'",
              `script-src 'self' 'unsafe-inline'${isDev ? " 'unsafe-eval'" : ""}`,
              "style-src 'self' 'unsafe-inline'",
              "img-src 'self' data: blob: https://*.supabase.co",
              "font-src 'self' data:",
              "connect-src 'self' https://*.supabase.co wss://*.supabase.co ws://localhost:* http://localhost:* ws://127.0.0.1:* http://127.0.0.1:* ws://*.local:* http://*.local:* ws://192.168.*:* http://192.168.*:* ws://10.*:* http://10.*:* ws://172.16.*:* http://172.16.*:* ws://172.17.*:* http://172.17.*:* ws://172.18.*:* http://172.18.*:* ws://172.19.*:* http://172.19.*:* ws://172.2*.*:* http://172.2*.*:* ws://172.30.*:* http://172.30.*:* ws://172.31.*:* http://172.31.*:*",
              "object-src 'none'",
              "base-uri 'self'",
              "form-action 'self'",
              "frame-ancestors 'none'",
            ].join("; "),
          },
        ],
      },
    ];
  },
};

export default nextConfig;
