import type { NextConfig } from "next";

const securityHeaders = [
  // Prevent clickjacking
  {
    key: "X-Frame-Options",
    value: "DENY",
  },
  // Prevent MIME type sniffing
  {
    key: "X-Content-Type-Options",
    value: "nosniff",
  },
  // Control referrer information
  {
    key: "Referrer-Policy",
    value: "strict-origin-when-cross-origin",
  },
  // HTTP Strict Transport Security (2 years, include subdomains)
  {
    key: "Strict-Transport-Security",
    value: "max-age=63072000; includeSubDomains; preload",
  },
  // Restrict browser features
  {
    key: "Permissions-Policy",
    value: "camera=(), microphone=(), geolocation=(), interest-cohort=()",
  },
  // Content Security Policy
  // Stripe's payment link is an external navigation (href), not a frame/script,
  // so we do not need to list buy.stripe.com in script-src or frame-src.
  {
    key: "Content-Security-Policy",
    value: [
      "default-src 'self'",
      // Next.js inline styles + Tailwind require unsafe-inline for now
      "style-src 'self' 'unsafe-inline'",
      // Next.js RSC and client navigation need self + data: for images
      "img-src 'self' data: https:",
      // Scripts: self + Next.js inline hydration + Cloudflare Turnstile
      "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://challenges.cloudflare.com",
      // API calls to same origin + Cloudflare Turnstile verification
      "connect-src 'self' https://challenges.cloudflare.com",
      // Cloudflare Turnstile renders in an iframe
      "frame-src https://challenges.cloudflare.com",
      // No plugins
      "object-src 'none'",
      // No base-uri override
      "base-uri 'self'",
      // Block all framing
      "frame-ancestors 'none'",
      // Form submissions only to same origin
      "form-action 'self'",
    ].join("; "),
  },
];

const nextConfig: NextConfig = {
  reactCompiler: true,
  async headers() {
    return [
      {
        // Apple App Site Association must be served as application/json with
        // no extension. Next.js defaults to octet-stream for extension-less
        // files — override so iOS accepts the file for universal links.
        source: "/.well-known/apple-app-site-association",
        headers: [
          { key: "Content-Type", value: "application/json" },
          { key: "Cache-Control", value: "public, max-age=3600" },
        ],
      },
      {
        source: "/.well-known/assetlinks.json",
        headers: [
          { key: "Content-Type", value: "application/json" },
          { key: "Cache-Control", value: "public, max-age=3600" },
        ],
      },
      {
        // Apply security headers to all routes
        source: "/(.*)",
        headers: securityHeaders,
      },
    ];
  },
};

export default nextConfig;
