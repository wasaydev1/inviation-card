import { DurableObject } from "cloudflare:workers";
import { getRandomText } from "./lib/typing-texts";
import type { Env } from "./worker-env";

type Phase = "lobby" | "countdown" | "racing" | "done";

type Player = {
  id: string;
  name: string;
  ready: boolean;
  progress: number;
  finished: boolean;
  wpm: number;
  accuracy: number;
};

type ClientMessage =
  | { type: "join"; name: string }
  | { type: "ready" }
  | {
      type: "progress";
      progress: number;
      wpm: number;
      accuracy: number;
      finished: boolean;
    }
  | { type: "rematch" };

/** 1v1 live race — max 2 typists per room */
export class RaceRoom extends DurableObject<Env> {
  private phase: Phase = "lobby";
  private text = "";
  private countdown: number | null = null;
  private players = new Map<string, Player>();
  private socketToPlayer = new Map<WebSocket, string>();
  private readonly openSockets = new Set<WebSocket>();
  private countdownChain: Promise<void> = Promise.resolve();

  constructor(ctx: DurableObjectState, env: Env) {
    super(ctx, env);
  }

  async fetch(request: Request): Promise<Response> {
    const upgrade = request.headers.get("Upgrade");
    if (upgrade?.toLowerCase() !== "websocket") {
      return new Response("Expected WebSocket", { status: 426 });
    }

    if (this.openSockets.size >= 2) {
      return new Response("Room full", { status: 403 });
    }

    const pair = new WebSocketPair();
    const [client, server] = Object.values(pair);

    this.ctx.acceptWebSocket(server);
    this.openSockets.add(server);

    return new Response(null, { status: 101, webSocket: client });
  }

  async webSocketMessage(ws: WebSocket, message: string | ArrayBuffer): Promise<void> {
    const raw = typeof message === "string" ? message : new TextDecoder().decode(message);
    let msg: ClientMessage;
    try {
      msg = JSON.parse(raw) as ClientMessage;
    } catch {
      return;
    }
    this.handleClientMessage(ws, msg);
  }

  async webSocketClose(ws: WebSocket, _code: number, _reason: string, _wasClean: boolean): Promise<void> {
    this.openSockets.delete(ws);
    this.handleClose(ws);
  }

  private handleClose(ws: WebSocket): void {
    const id = this.socketToPlayer.get(ws);
    if (id) {
      this.players.delete(id);
      this.socketToPlayer.delete(ws);
    }
    if (this.phase !== "done" && this.players.size === 0) {
      this.resetState();
    }
    this.broadcast();
  }

  private handleClientMessage(ws: WebSocket, msg: ClientMessage): void {
    if (msg.type === "join") {
      if (this.socketToPlayer.has(ws)) return;
      const name = String(msg.name || "Guest").trim().slice(0, 20) || "Guest";
      const id = crypto.randomUUID();
      this.players.set(id, {
        id,
        name,
        ready: false,
        progress: 0,
        finished: false,
        wpm: 0,
        accuracy: 100,
      });
      this.socketToPlayer.set(ws, id);
      ws.send(JSON.stringify({ type: "joined", playerId: id }));
      this.broadcast();
      return;
    }

    const pid = this.socketToPlayer.get(ws);
    if (!pid) return;

    if (msg.type === "ready") {
      const p = this.players.get(pid);
      if (!p || this.phase !== "lobby") return;
      p.ready = true;
      this.broadcast();
      this.maybeStartCountdown();
      return;
    }

    if (msg.type === "progress") {
      if (this.phase !== "racing") return;
      const p = this.players.get(pid);
      if (!p || p.finished) return;
      p.progress = Math.min(1, Math.max(0, msg.progress));
      p.wpm = Math.round(msg.wpm);
      p.accuracy = Math.round(msg.accuracy * 10) / 10;
      if (msg.finished) {
        p.finished = true;
        this.phase = "done";
      }
      this.broadcast();
      return;
    }

    if (msg.type === "rematch") {
      if (this.phase !== "done") return;
      for (const pl of this.players.values()) {
        pl.ready = false;
        pl.progress = 0;
        pl.finished = false;
        pl.wpm = 0;
        pl.accuracy = 100;
      }
      this.phase = "lobby";
      this.text = "";
      this.countdown = null;
      this.broadcast();
    }
  }

  private maybeStartCountdown(): void {
    if (this.players.size < 2) return;
    const all = [...this.players.values()];
    if (!all.every((p) => p.ready)) return;
    this.countdownChain = this.countdownChain.then(() => this.runCountdown());
  }

  private async runCountdown(): Promise<void> {
    if (this.phase !== "lobby") return;

    this.phase = "countdown";
    this.text = getRandomText();

    for (let i = 3; i >= 1; i--) {
      this.countdown = i;
      this.broadcast();
      await delay(1000);
    }

    this.countdown = 0;
    this.broadcast();
    await delay(700);

    this.phase = "racing";
    this.countdown = null;
    this.broadcast();
  }

  private resetState(): void {
    this.phase = "lobby";
    this.text = "";
    this.countdown = null;
  }

  private broadcast(): void {
    const payload = this.buildPayload();
    const raw = JSON.stringify(payload);
    for (const ws of this.socketToPlayer.keys()) {
      try {
        ws.send(raw);
      } catch {
        /* ignore */
      }
    }
  }

  private buildPayload() {
    const revealText = this.phase === "racing" || this.phase === "done";
    return {
      type: "sync" as const,
      phase: this.phase,
      countdown: this.countdown,
      text: revealText ? this.text : null,
      players: [...this.players.values()].map((p) => ({
        id: p.id,
        name: p.name,
        ready: p.ready,
        progress: p.progress,
        finished: p.finished,
        wpm: p.wpm,
        accuracy: p.accuracy,
      })),
    };
  }
}

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
