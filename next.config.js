/**
 * Run `build` or `dev` with `SKIP_ENV_VALIDATION` to skip env validation. This is especially useful
 * for Docker builds.
 */
await import("./src/env.js");

/** @type {import("next").NextConfig} */
const config = {
  reactStrictMode: true,
  reactCompiler: true,
  async headers() {
    // Cross-origin isolation everywhere so Zoom SDK gets SharedArrayBuffer no matter the entry route.
    // credentialless avoids requiring CORP on every Zoom CDN / avatar asset.
    return [
      {
        source: "/:path*",
        headers: [
          { key: "Cross-Origin-Opener-Policy", value: "same-origin" },
          { key: "Cross-Origin-Embedder-Policy", value: "credentialless" },
        ],
      },
    ];
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "source.boringavatars.com",
        pathname: "**/*",
      },
    ],
  },
};

export default config;
