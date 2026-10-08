import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "i.ytimg.com",
      },
    ],
  },
  // The editor route is a server function, while public assets are served by
  // Vercel's CDN. Keep gallery originals out of its file trace.
  outputFileTracingExcludes: {
    "/editor/episodios/\\[slug\\]": ["./public/**/*", "./local-gallery/**/*"],
  },
};

export default nextConfig;
