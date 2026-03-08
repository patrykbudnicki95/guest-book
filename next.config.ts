import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";

const withNextIntl = createNextIntlPlugin();

// Extract R2 domain hostname from environment variable
const r2Domain = process.env.NEXT_PUBLIC_R2_DOMAIN;
const r2Hostname = r2Domain ? new URL(r2Domain).hostname : null;

const nextConfig: NextConfig = {
  cacheComponents: true,
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "placehold.co",
      },
      ...(r2Hostname
        ? [
            {
              protocol: "https" as const,
              hostname: r2Hostname,
            },
          ]
        : []),
    ],
  },
};

export default withNextIntl(nextConfig);
