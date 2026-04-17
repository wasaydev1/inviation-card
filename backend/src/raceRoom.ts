import { randomUUID } from "node:crypto";
import type { WebSocket } from "ws";
import mongoose from "mongoose";
import { getRandomText } from "./texts.js";
import { RaceMatch } from "./models/RaceMatch.js";

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

/** Matches Cloudflare `RaceRoom` durable object behaviour (same wire protocol). */
export class RaceRoomSession {
  private phase: Phase = "lobby";
  private text = "";
  private countdown: number | null = null;
  private players = new Map<string, Player>();
  private socketToPlayer = new Map<WebSocket, string>();
  private readonly openSockets = new Set<WebSocket>();
  private countdownChain: Promise<void> = Promise.resolve();
  private persistedDone = false;

  constructor(
    readonly roomId: string,
    private readonly onRoomVacated: () => void,
  ) {}

  handleConnection(ws: WebSocket): void {
    if (this.openSockets.size >= 2) {
      ws.close(1008, "Room full");
      return;
    }

    this.openSockets.add(ws);

    ws.on("message", (raw: Buffer | ArrayBuffer | Buffer[]) => {
      const str = Buffer.isBuffer(raw)
        ? raw.toString("utf8")
        : typeof raw === "string"
          ? raw
          : Buffer.from(raw as ArrayBuffer).toString("utf8");
      let msg: ClientMessage;
      try {
        msg = JSON.parse(str) as ClientMessage;
      } catch {
        return;
      }
      this.handleClientMessage(ws, msg);
    });

    ws.on("close", () => {
      this.openSockets.delete(ws);
      this.handleClose(ws);
      if (this.players.size === 0 && this.openSockets.size === 0) {
        this.onRoomVacated();
      }
    });
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
      const id = randomUUID();
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
        void this.persistResultIfNeeded();
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
      this.persistedDone = false;
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
    this.persistedDone = false;
  }

  private broadcast(): void {
    const payload = this.buildPayload();
    const raw = JSON.stringify(payload);
    for (const ws of this.socketToPlayer.keys()) {
      if (ws.readyState === 1) {
        try {
          ws.send(raw);
        } catch {
          /* ignore */
        }
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

  private async persistResultIfNeeded(): Promise<void> {
    if (this.persistedDone) return;
    this.persistedDone = true;
    if (mongoose.connection.readyState !== 1) return;
    try {
      await RaceMatch.create({
        roomId: this.roomId,
        passagePreview: this.text.slice(0, 200),
        completedAt: new Date(),
        players: [...this.players.values()].map((p) => ({
          playerId: p.id,
          name: p.name,
          wpm: p.wpm,
          accuracy: p.accuracy,
          finished: p.finished,
        })),
      });
    } catch (e) {
      console.error("[mongo] race save failed", e);
    }
  }
}

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

const rooms = new Map<string, RaceRoomSession>();

export function getOrCreateRoom(roomId: string): RaceRoomSession {
  let room = rooms.get(roomId);
  if (!room) {
    room = new RaceRoomSession(roomId, () => {
      rooms.delete(roomId);
    });
    rooms.set(roomId, room);
  }
  return room;
}

/** Exported for tests / metrics */
export function roomCount(): number {
  return rooms.size;
}
