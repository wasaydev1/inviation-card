import { createFileRoute, Link } from "@tanstack/react-router";
import { Check, Copy, Loader2 } from "lucide-react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { SiteHeader } from "@/components/layout/SiteHeader";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { RaceTrack } from "@/components/typing/RaceTrack";
import { StatsBar } from "@/components/typing/StatsBar";
import { TypingDisplay } from "@/components/typing/TypingDisplay";
import { useTypingEngine } from "@/hooks/use-typing-engine";
import type { LiveRaceSync } from "@/lib/live-race";
import { raceRoomWsUrl } from "@/lib/live-race";
import { getStats, recordRace } from "@/lib/storage";
import { copyTextToClipboard } from "@/lib/clipboard";
import { cn } from "@/lib/utils";

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
  const [inviteCopied, setInviteCopied] = useState(false);
  /** Hide win/lose popup until next race (reset when phase leaves `done`) */
  const [resultPopupDismissed, setResultPopupDismissed] = useState(false);
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

  useEffect(() => {
    if (phase !== "done") setResultPopupDismissed(false);
  }, [phase]);

  const raceOutcome = useMemo(() => {
    if (phase !== "done" || !sync?.players?.length || !myId) return null;
    const me = sync.players.find((p) => p.id === myId);
    const opp = sync.players.find((p) => p.id !== myId);
    if (!me || !opp) return null;
    const bothFinished = me.finished && opp.finished;
    if (bothFinished && me.wpm === opp.wpm) {
      return { kind: "tie" as const, myWpm: me.wpm, oppWpm: opp.wpm, oppName: opp.name };
    }
    if (me.finished && !opp.finished) {
      return { kind: "win" as const, myWpm: me.wpm, oppWpm: opp.wpm, oppName: opp.name };
    }
    if (!me.finished && opp.finished) {
      return { kind: "lose" as const, myWpm: me.wpm, oppWpm: opp.wpm, oppName: opp.name };
    }
    if (bothFinished) {
      if (me.wpm > opp.wpm) {
        return { kind: "win" as const, myWpm: me.wpm, oppWpm: opp.wpm, oppName: opp.name };
      }
      return { kind: "lose" as const, myWpm: me.wpm, oppWpm: opp.wpm, oppName: opp.name };
    }
    return { kind: "lose" as const, myWpm: me.wpm, oppWpm: opp.wpm, oppName: opp.name };
  }, [phase, sync?.players, myId]);

  const sendReady = useCallback(() => {
    wsRef.current?.send(JSON.stringify({ type: "ready" }));
  }, []);

  const sendRematch = useCallback(() => {
    wsRef.current?.send(JSON.stringify({ type: "rematch" }));
    setRecorded(false);
    setResultPopupDismissed(true);
  }, []);

  const showRaceResultPopup = phase === "done" && !!raceOutcome && !resultPopupDismissed;

  const inviteLink = useMemo(() => {
    if (typeof window === "undefined") return "";
    return `${window.location.origin}/multiplayer/${encodeURIComponent(roomId)}`;
  }, [roomId]);

  const copyInvite = useCallback(async () => {
    if (!inviteLink) return;
    const ok = await copyTextToClipboard(inviteLink);
    if (ok) {
      setInviteCopied(true);
      window.setTimeout(() => setInviteCopied(false), 2500);
    }
  }, [inviteLink]);

  const meInSync = useMemo(() => sync?.players?.find((p) => p.id === myId), [sync?.players, myId]);
  const opponentInSync = useMemo(() => sync?.players?.find((p) => p.id !== myId), [sync?.players, myId]);
  const imReady = !!meInSync?.ready;
  const opponentReady = !!opponentInSync?.ready;

  const racers = useMemo(() => {
    const players = sync?.players ?? [];
    const colors = ["cyan", "magenta"] as const;
    return players.map((p, i) => ({
      name: p.name,
      progress: p.progress,
      color: colors[i % 2]!,
      isPlayer: p.id === myId,
      lobbyReady: phase === "lobby" ? p.ready : undefined,
    }));
  }, [sync?.players, myId, phase]);

  const readyBtnLabel = (() => {
    const n = sync?.players?.length ?? 0;
    if (n < 2) return "Waiting for friend…";
    if (imReady && !opponentReady) return "You're ready · matching…";
    if (imReady && opponentReady) return "Starting…";
    return "Ready";
  })();

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

  const opponentWonLabel =
    raceOutcome?.oppName.trim().toLowerCase() === "guest" ? "Guest won!" : `${raceOutcome?.oppName ?? "Opponent"} won!`;

  return (
    <div className="min-h-screen">
      <SiteHeader />
      <Dialog
        open={showRaceResultPopup}
        onOpenChange={(o) => {
          if (!o) setResultPopupDismissed(true);
        }}
      >
        <DialogContent className="sm:max-w-md border-border bg-background text-center">
          <DialogHeader className="text-center sm:text-center space-y-3">
            {raceOutcome?.kind === "tie" && (
              <>
                <DialogTitle className="font-display text-3xl md:text-4xl font-black text-neon-amber">
                  It&apos;s a tie!
                </DialogTitle>
                <DialogDescription className="text-base text-muted-foreground">
                  Same WPM · You {raceOutcome.myWpm} — Them {raceOutcome.oppWpm}
                </DialogDescription>
              </>
            )}
            {raceOutcome?.kind === "win" && (
              <>
                <DialogTitle className="font-display text-3xl md:text-4xl font-black text-gradient-primary">
                  You won!
                </DialogTitle>
                <DialogDescription className="text-base text-muted-foreground">
                  {raceOutcome.myWpm} WPM vs {raceOutcome.oppName}&apos;s {raceOutcome.oppWpm}
                </DialogDescription>
              </>
            )}
            {raceOutcome?.kind === "lose" && (
              <>
                <DialogTitle className="font-display text-3xl md:text-4xl font-black text-neon-magenta">
                  {opponentWonLabel}
                </DialogTitle>
                <DialogDescription className="text-base text-muted-foreground">
                  You {raceOutcome.myWpm} WPM · {raceOutcome.oppName} {raceOutcome.oppWpm} WPM
                </DialogDescription>
              </>
            )}
          </DialogHeader>
          <DialogFooter className="flex-col gap-2 sm:flex-col">
            <Button
              type="button"
              className="w-full glow-cyan bg-gradient-primary text-primary-foreground font-bold"
              onClick={() => setResultPopupDismissed(true)}
            >
              Continue
            </Button>
            <Button
              type="button"
              variant="outline"
              className="w-full"
              onClick={() => {
                sendRematch();
              }}
            >
              Rematch
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
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
              onClick={() => void copyInvite()}
              title={inviteLink || undefined}
              aria-label={inviteCopied ? "Link copied" : "Copy invite link to clipboard"}
              className={cn(
                "inline-flex items-center justify-center gap-2 rounded-lg border px-4 py-2 text-sm font-semibold transition",
                inviteCopied
                  ? "border-neon-lime/50 bg-neon-lime/10 text-neon-lime"
                  : "border-border bg-surface/60 backdrop-blur hover:bg-surface",
              )}
            >
              {inviteCopied ? (
                <>
                  <Check className="h-4 w-4 shrink-0" strokeWidth={2.5} />
                  Copied!
                </>
              ) : (
                <>
                  <Copy className="h-4 w-4 shrink-0 opacity-80" />
                  Copy invite link
                </>
              )}
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

        {phase === "lobby" && (sync?.players?.length ?? 0) >= 2 && (
          <div className="rounded-xl border border-border/80 bg-surface/50 backdrop-blur px-4 py-3 flex flex-wrap items-center justify-between gap-3">
            <div className="text-[10px] uppercase tracking-widest text-muted-foreground w-full sm:w-auto">
              Match status
            </div>
            <div className="flex flex-1 items-center justify-center gap-2 sm:gap-4 min-w-0">
              <div
                className={cn(
                  "flex items-center gap-2 rounded-lg px-3 py-2 border text-sm font-medium transition-colors",
                  imReady
                    ? "border-neon-lime/50 bg-neon-lime/10 text-neon-lime"
                    : "border-border bg-background/40 text-muted-foreground",
                )}
              >
                You
                {imReady ? <Check className="h-4 w-4" strokeWidth={2.5} /> : null}
              </div>
              <div className="flex flex-col items-center gap-0.5 text-muted-foreground shrink-0">
                <div className="h-px w-8 sm:w-14 bg-gradient-to-r from-transparent via-primary/50 to-transparent" />
                <span className="text-[9px] uppercase tracking-widest">vs</span>
              </div>
              <div
                className={cn(
                  "flex items-center gap-2 rounded-lg px-3 py-2 border text-sm font-medium transition-colors max-w-[44%] sm:max-w-none",
                  opponentReady
                    ? "border-neon-magenta/50 bg-neon-magenta/10 text-neon-magenta"
                    : "border-border bg-background/40 text-muted-foreground",
                )}
              >
                <span className="truncate font-mono">{opponentInSync?.name ?? "Opponent"}</span>
                {opponentReady ? (
                  <Check className="h-4 w-4 shrink-0" strokeWidth={2.5} />
                ) : (
                  <Loader2 className="h-4 w-4 shrink-0 animate-spin opacity-60" />
                )}
              </div>
            </div>
            {imReady && !opponentReady && (
              <p className="w-full sm:w-auto text-xs text-muted-foreground text-center sm:text-right">
                Waiting for opponent to press Ready — then countdown starts.
              </p>
            )}
          </div>
        )}

        <div className="flex flex-wrap items-center gap-3">
          {phase === "lobby" && (
            <button
              type="button"
              onClick={sendReady}
              disabled={
                wsState !== "open" ||
                !myId ||
                (sync?.players?.length ?? 0) < 2 ||
                imReady
              }
              className="rounded-xl bg-gradient-primary text-primary-foreground font-bold px-6 py-3 glow-lime hover:opacity-90 transition disabled:opacity-40 disabled:cursor-not-allowed"
            >
              {readyBtnLabel}
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
