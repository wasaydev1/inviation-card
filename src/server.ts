import handler from "@tanstack/react-start/server-entry";
import type { Env } from "./worker-env";

/** Durable Object export lives in `worker.ts` only — avoids pulling `cloudflare:workers` into Vite SSR. */

const ROOM_PATH = /^\/api\/race-room\/([^/]+)$/;

export default {
  fetch(request: Request, env: Env, _ctx: ExecutionContext): Response | Promise<Response> {
    const url = new URL(request.url);
    const match = ROOM_PATH.exec(url.pathname);
    if (match && request.headers.get("Upgrade")?.toLowerCase() === "websocket") {
      const roomId = decodeURIComponent(match[1]);
      if (!/^[a-zA-Z0-9_-]{4,32}$/.test(roomId)) {
        return new Response("Invalid room id", { status: 400 });
      }
      const id = env.RACE_ROOMS.idFromName(roomId);
      const stub = env.RACE_ROOMS.get(id);
      return stub.fetch(request);
    }
    return handler.fetch(request);
  },
};
