/** @type {import('next').NextConfig} */
const { PHASE_DEVELOPMENT_SERVER } = require("next/constants");

module.exports = (phase) => ({
  // Production builds must not replace assets served by a running dev server.
  distDir: phase === PHASE_DEVELOPMENT_SERVER ? ".next-dev" : ".next",
  images: { remotePatterns: [] },
  async redirects() {
    return [{
      source: "/:path*",
      has: [{ type: "host", value: "rahat-energy\\.com" }],
      destination: "https://www.rahat-energy.com/:path*",
      permanent: true,
    }];
  },
  async headers() {
    return [{
      source: "/optimized/:path*",
      headers: [{ key: "Cache-Control", value: "public, max-age=31536000, immutable" }],
    }];
  },
});
