// @lovable.dev/vite-tanstack-config already includes the following — do NOT add them manually
// or the app will break with duplicate plugins:
//   - tanstackStart, viteReact, tailwindcss, tsConfigPaths, cloudflare (build-only),
//     componentTagger (dev-only), VITE_* env injection, @ path alias, React/TanStack dedupe,
//     error logger plugins, and sandbox detection (port/host/strictPort).
// You can pass additional config via defineConfig({ vite: { ... } }) if needed.
import { defineConfig } from "@lovable.dev/vite-tanstack-config";

export default defineConfig({
  vite: {
    server: {
      /** Same Wi‑Fi / LAN se open: `http://<PC-ka-IP>:port` (terminal mein “Network” line dikhegi) */
      host: true,
      proxy: {
        // `backend/` Express + ws (see backend/README.md) — run `npm run backend:dev` on 4000
        "/api/race-room": {
          target: "http://127.0.0.1:4000",
          changeOrigin: true,
          ws: true,
        },
      },
    },
  },
});
