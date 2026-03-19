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
      // Scripts: self + Next.js inline hydration
      "script-src 'self' 'unsafe-inline' 'unsafe-eval'",
      // API calls only to same origin
      "connect-src 'self'",
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
        // Apply security headers to all routes
        source: "/(.*)",
        headers: securityHeaders,
      },
    ];
  },
};

export default nextConfig;
