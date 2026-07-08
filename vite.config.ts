import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import { TanStackRouterVite } from "@tanstack/router-plugin/vite";
import tsconfigPaths from "vite-tsconfig-paths";

export default defineConfig({
  plugins: [
    TanStackRouterVite({ target: "react", autoCodeSplitting: true }),
    react(),
    tailwindcss(),
    tsconfigPaths(),
  ],
  server: {
    /** LAN: open `http://<your-IP>:port` from another device on the same network */
    host: true,
    proxy: {
      "/api/race-room": {
        target: "http://127.0.0.1:4000",
        changeOrigin: true,
        ws: true,
      },
    },
  },
  preview: {
    host: true,
    proxy: {
      "/api/race-room": {
        target: "http://127.0.0.1:4000",
        changeOrigin: true,
        ws: true,
      },
    },
  },
});
