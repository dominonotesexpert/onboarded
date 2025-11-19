/**
 * Remix configuration aligned with FlowForge requirements.
 * Enables Tailwind/PostCSS integration and the v3 feature flags
 * for the latest data APIs.
 */
export default {
  ignoredRouteFiles: ["**/.*"],
  future: {
    v3_fetcherPersist: true,
    v3_relativeSplatPath: true,
    v3_routeConvention: true,
    v3_singleFetch: true,
    unstable_optimizeDeps: true
  },
  postcss: true,
  serverModuleFormat: "esm",
  tailwind: true,
  watchPaths: ["./prisma/schema.prisma"]
};
