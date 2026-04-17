export type LiveRacePhase = "lobby" | "countdown" | "racing" | "done";

export type LiveRacePlayer = {
  id: string;
  name: string;
  ready: boolean;
  progress: number;
  finished: boolean;
  wpm: number;
  accuracy: number;
};

export type LiveRaceSync = {
  type: "sync";
  phase: LiveRacePhase;
  countdown: number | null;
  text: string | null;
  players: LiveRacePlayer[];
};

/**
 * When set, must be the full base (no trailing slash), e.g. `ws://127.0.0.1:4000/api/race-room`
 * for a remote Express server. If unset, the app uses the Vite dev server (proxy → backend) or
 * the same host in production.
 */
export function raceRoomWsUrl(roomId: string): string {
  const fromEnv =
    typeof import.meta !== "undefined" && import.meta.env?.VITE_RACE_WS_URL
      ? String(import.meta.env.VITE_RACE_WS_URL).trim()
      : "";
  if (fromEnv) {
    return `${fromEnv.replace(/\/$/, "")}/${encodeURIComponent(roomId)}`;
  }
  const proto = typeof window !== "undefined" && window.location.protocol === "https:" ? "wss:" : "ws:";
  const host = typeof window !== "undefined" ? window.location.host : "localhost";
  return `${proto}//${host}/api/race-room/${encodeURIComponent(roomId)}`;
}

export function generateRoomId(): string {
  const chars = "abcdefghijklmnopqrstuvwxyz0123456789";
  const bytes = new Uint8Array(8);
  crypto.getRandomValues(bytes);
  let out = "";
  for (let i = 0; i < 8; i++) out += chars[bytes[i]! % chars.length];
  return out;
}
