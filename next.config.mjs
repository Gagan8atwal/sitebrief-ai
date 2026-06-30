/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  // Type-checking and linting run as dedicated gates (`npm run type-check`,
  // `npm run lint`) in CI and locally, so we skip Next's redundant in-build
  // passes. This keeps the gates enforced while drastically cutting build-time
  // memory (the in-build whole-program tsc is the heaviest step).
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  // Lower peak build memory — important on constrained CI/dev machines.
  experimental: {
    webpackMemoryOptimizations: true,
  },
  webpack: (config, { dev }) => {
    // The persistent filesystem cache serializes large strings into memory
    // during the production build, which can exhaust RAM on small machines.
    // Disable it for production builds only; dev keeps fast HMR caching.
    if (!dev) {
      config.cache = false;
    }
    return config;
  },
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "X-Frame-Options", value: "DENY" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          {
            key: "Permissions-Policy",
            value: "camera=(), microphone=(), geolocation=()",
          },
        ],
      },
    ];
  },
};

export default nextConfig;
