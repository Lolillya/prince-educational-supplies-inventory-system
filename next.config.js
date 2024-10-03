/**
 * Run `build` or `dev` with `SKIP_ENV_VALIDATION` to skip env validation. This is especially useful
 * for Docker builds.
 */
await import("./src/env.js");

import withPWA from "next-pwa"; // Import next-pwa

/** @type {import("next").NextConfig} */
const config = withPWA({
  dest: "public", // Folder where service worker will be generated
  disable: process.env.NODE_ENV === "development", // Disable PWA in development mode
  register: true, // Register the service worker automatically
  skipWaiting: true, // Skip waiting phase and immediately activate the updated service worker
  buildExcludes: [/middleware-manifest\.json$/], // Avoid precaching build files you don't need
  runtimeCaching: [
    {
      urlPattern: /^https:\/\/your-supabase-url\.com\//,
      handler: "NetworkFirst", // Attempt to get fresh data from the network before falling back to cache
      options: {
        cacheName: "supabase-api-cache",
        expiration: {
          maxEntries: 50,
          maxAgeSeconds: 24 * 60 * 60, // Cache for 1 day
        },
      },
    },
  ],
});

export default config;
