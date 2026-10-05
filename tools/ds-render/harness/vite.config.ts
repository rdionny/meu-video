import { defineConfig } from "vite";

// Plain Vite: the Diffusion Studio packages are TypeScript sources resolved
// through the monorepo's workspaces. Cross-origin isolation is required by the
// encoder (SharedArrayBuffer between the audio worklet and the frame loop).
export default defineConfig({
  root: __dirname,
  logLevel: "warn",
  server: {
    headers: {
      "Cross-Origin-Opener-Policy": "same-origin",
      "Cross-Origin-Embedder-Policy": "credentialless",
    },
  },
  optimizeDeps: { noDiscovery: false },
});
