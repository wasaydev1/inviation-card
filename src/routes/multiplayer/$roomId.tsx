import { createFileRoute, Link } from "@tanstack/react-router";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { SiteHeader } from "@/components/layout/SiteHeader";
import { RaceTrack } from "@/components/typing/RaceTrack";
import { StatsBar } from "@/components/typing/StatsBar";
import { TypingDisplay } from "@/components/typing/TypingDisplay";
import { useTypingEngine } from "@/hooks/use-typing-engine";
import type { LiveRaceSync } from "@/lib/live-race";
import { raceRoomWsUrl } from "@/lib/live-race";
import { getStats, recordRace } from "@/lib/storage";

export const Route = createFileRoute("/multiplayer/$roomId")({
  head: () => ({
    meta: [
      { title: "Live room — Velocity Typing" },
      { name: "description", content: "1v1 typing race in progress." },
    ],
  }),
  component: LiveRoomPage,
});

function LiveRoomPage() {
  const { roomId } = Route.useParams();
  const [sync, setSync] = useState<LiveRaceSync | null>(null);
  const [myId, setMyId] = useState<string | null>(null);
  const [wsState, setWsState] = useState<"connecting" | "open" | "closed" | "error">(
    "connecting",
  );
  const [recorded, setRecorded] = useState(false);
  const wsRef = useRef<WebSocket | null>(null);
  const username = getStats().username;

  const raceText = sync?.text ?? "";
  const phase = sync?.phase ?? "lobby";
  const { state, metrics, handleChange } = useTypingEngine(raceText);

  useEffect(() => {
    setRecorded(false);
    setSync(null);
    setMyId(null);
    const url = raceRoomWsUrl(roomId);
    let closed = false;
    const ws = new WebSocket(url);
    wsRef.current = ws;
    setWsState("connecting");

    ws.onopen = () => {
      if (closed) return;
      setWsState("open");
      ws.send(JSON.stringify({ type: "join", name: username }));
    };

    ws.onmessage = (ev) => {
      try {
        const data = JSON.parse(String(ev.data)) as
          | { type: "joined"; playerId: string }
          | LiveRaceSync;
        if (data.type === "joined") {
          setMyId(data.playerId);
          return;
        }
        if (data.type === "sync") {
          setSync(data);
        }
      } catch {
        /* ignore */
      }
    };

    ws.onerror = () => {
      if (!closed) setWsState("error");
    };

    ws.onclose = () => {
      closed = true;
      setWsState("closed");
    };

    return () => {
      closed = true;
      ws.close();
      wsRef.current = null;
    };
  }, [roomId, username]);

  useEffect(() => {
    const ws = wsRef.current;
    if (!ws || ws.readyState !== WebSocket.OPEN || phase !== "racing") return;
    ws.send(
      JSON.stringify({
        type: "progress",
        progress: metrics.progress,
        wpm: metrics.wpm,
        accuracy: metrics.accuracy,
        finished: metrics.isFinished,
      }),
    );
  }, [phase, metrics.progress, metrics.wpm, metrics.accuracy, metrics.isFinished]);

  useEffect(() => {
    if (phase !== "done" || !metrics.isFinished || recorded) return;
    const players = sync?.players ?? [];
    const me = players.find((p) => p.id === myId);
    const opponent = players.find((p) => p.id !== myId);
    let won = false;
    if (me?.finished) {
      if (!opponent?.finished) won = true;
      else won = me.wpm >= opponent.wpm;
    }
    recordRace({ wpm: metrics.wpm, accuracy: metrics.accuracy, won });
    setRecorded(true);
  }, [phase, metrics.isFinished, metrics.wpm, metrics.accuracy, recorded, sync?.players, myId]);

  const sendReady = useCallback(() => {
    wsRef.current?.send(JSON.stringify({ type: "ready" }));
  }, []);

  const sendRematch = useCallback(() => {
    wsRef.current?.send(JSON.stringify({ type: "rematch" }));
    setRecorded(false);
  }, []);

  const copyInvite = useCallback(() => {
    const link = `${window.location.origin}/multiplayer/${roomId}`;
    void navigator.clipboard.writeText(link);
  }, [roomId]);

  const racers = useMemo(() => {
    const players = sync?.players ?? [];
    const colors = ["cyan", "magenta"] as const;
    return players.map((p, i) => ({
      name: p.name,
      progress: p.progress,
      color: colors[i % 2]!,
      isPlayer: p.id === myId,
    }));
  }, [sync?.players, myId]);

  const typingEnabled = phase === "racing" && !!raceText && !metrics.isFinished;
  const countdown = sync?.countdown;

  const statusLine =
    wsState === "connecting"
      ? "Connecting…"
      : wsState === "open"
        ? "Connected"
        : wsState === "error"
          ? "Connection error"
          : "Disconnected";

  return (
    <div className="min-h-screen">
      <SiteHeader />
      <main className="max-w-5xl mx-auto px-4 md:px-6 py-8 md:py-12 space-y-6">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <div className="text-xs uppercase tracking-widest text-neon-lime">Friend race</div>
            <h1 className="font-display text-3xl md:text-4xl font-black">Live lobby</h1>
            <p className="text-sm text-muted-foreground mt-1 font-mono">
              Room <span className="text-foreground">{roomId}</span> · {statusLine}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={copyInvite}
              className="rounded-lg border border-border bg-surface/60 backdrop-blur px-4 py-2 text-sm font-semibold hover:bg-surface transition"
            >
              Copy invite link
            </button>
            <Link
              to="/multiplayer"
              className="rounded-lg border border-border bg-surface/60 backdrop-blur px-4 py-2 text-sm font-semibold hover:bg-surface transition inline-flex items-center"
            >
              New room
            </Link>
          </div>
        </div>

        <RaceTrack racers={racers} />

        <div className="flex flex-wrap items-center gap-3">
          {phase === "lobby" && (
            <button
              type="button"
              onClick={sendReady}
              disabled={wsState !== "open" || !myId || (sync?.players?.length ?? 0) < 2}
              className="rounded-xl bg-gradient-primary text-primary-foreground font-bold px-6 py-3 glow-lime hover:opacity-90 transition disabled:opacity-40"
            >
              {(sync?.players?.length ?? 0) < 2 ? "Waiting for friend…" : "Ready"}
            </button>
          )}
          {phase === "done" && (
            <button
              type="button"
              onClick={sendRematch}
              className="rounded-xl border border-border bg-surface/60 px-6 py-3 font-semibold hover:bg-surface transition"
            >
              Rematch
            </button>
          )}
        </div>

        {(sync?.players?.length ?? 0) < 2 && phase === "lobby" && (
          <div className="rounded-xl border border-border/60 bg-surface/40 px-4 py-3 text-sm text-muted-foreground">
            Share the link with a friend. The <strong>Ready</strong> button unlocks when two players are in the room.
          </div>
        )}

        <StatsBar
          wpm={metrics.wpm}
          accuracy={metrics.accuracy}
          progress={metrics.progress}
          elapsedSec={metrics.elapsedSec}
        />

        <div className="relative">
          {phase === "racing" || phase === "done" ? (
            <TypingDisplay text={state.text} input={state.input} />
          ) : (
            <div className="font-mono text-lg md:text-xl rounded-2xl border border-dashed border-border bg-surface/40 p-8 md:p-10 text-center text-muted-foreground">
              {phase === "lobby" ? "Passage loads when the race starts." : "Get ready…"}
            </div>
          )}
          {phase === "countdown" && countdown !== null && (
            <div className="absolute inset-0 flex items-center justify-center rounded-2xl bg-background/85 backdrop-blur-sm">
              <div className="font-display text-7xl md:text-9xl font-black text-gradient-primary animate-pulse">
                {countdown === 0 ? "GO!" : countdown}
              </div>
            </div>
          )}
        </div>

        <textarea
          value={state.input}
          onChange={(e) => handleChange(e.target.value)}
          disabled={!typingEnabled}
          onPaste={(e) => e.preventDefault()}
          spellCheck={false}
          autoComplete="off"
          className="w-full font-mono text-base rounded-xl border border-border bg-surface/60 backdrop-blur p-4 focus:outline-none focus:ring-2 focus:ring-primary/60 disabled:opacity-50"
          rows={3}
          placeholder={
            phase === "racing"
              ? "Type the passage…"
              : phase === "lobby"
                ? "Waiting for countdown…"
                : "Race finished"
          }
        />

        {phase === "done" && sync && (
          <div className="rounded-2xl border border-border bg-gradient-to-br from-surface-2 to-surface p-8 shadow-elevated space-y-4">
            <div className="text-xs uppercase tracking-widest text-neon-cyan text-center">Results</div>
            <div className="grid gap-3 sm:grid-cols-2">
              {sync.players
                .slice()
                .sort((a, b) => b.wpm - a.wpm)
                .map((p) => (
                  <div
                    key={p.id}
                    className={
                      "rounded-xl border p-4 text-center " +
                      (p.id === myId ? "border-primary/60 bg-primary/5" : "border-border bg-surface/40")
                    }
                  >
                    <div className="text-xs uppercase tracking-widest text-muted-foreground">
                      {p.id === myId ? "You" : p.name}
                    </div>
                    <div className="font-display text-3xl font-black mt-1">{p.wpm}</div>
                    <div className="text-sm text-muted-foreground">WPM · {p.accuracy.toFixed(1)}% acc</div>
                  </div>
                ))}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
