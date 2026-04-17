import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useRef, useState } from "react";
import { SiteHeader } from "@/components/layout/SiteHeader";
import { TypingDisplay } from "@/components/typing/TypingDisplay";
import { StatsBar } from "@/components/typing/StatsBar";
import { RaceTrack } from "@/components/typing/RaceTrack";
import { useTypingEngine } from "@/hooks/use-typing-engine";
import { getRandomText } from "@/lib/typing-texts";
import { getStats, recordRace } from "@/lib/storage";

export const Route = createFileRoute("/race")({
  head: () => ({
    meta: [
      { title: "Race — Velocity Typing" },
      {
        name: "description",
        content: "Jump into a head-to-head typing race against AI rivals. Earn XP and climb the ranks.",
      },
      { property: "og:title", content: "Race — Velocity Typing" },
      { property: "og:description", content: "Race, win, level up." },
    ],
  }),
  component: RacePage,
});

interface Bot {
  name: string;
  wpm: number;
  color: "magenta" | "lime" | "amber";
}

function RacePage() {
  const [text, setText] = useState(() => getRandomText());
  const [countdown, setCountdown] = useState<number | null>(3);
  const [bots, setBots] = useState<Bot[]>(() => generateBots());
  const [botProgress, setBotProgress] = useState<number[]>([0, 0, 0]);
  const [recorded, setRecorded] = useState(false);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const { state, metrics, handleChange, reset } = useTypingEngine(text);

  // Countdown
  useEffect(() => {
    if (countdown === null) return;
    if (countdown === 0) {
      const t = setTimeout(() => {
        setCountdown(null);
        inputRef.current?.focus();
      }, 600);
      return () => clearTimeout(t);
    }
    const t = setTimeout(() => setCountdown((c) => (c ?? 1) - 1), 1000);
    return () => clearTimeout(t);
  }, [countdown]);

  // Bot progress simulation
  useEffect(() => {
    if (countdown !== null) return;
    const startedAt = Date.now();
    const id = window.setInterval(() => {
      const elapsed = (Date.now() - startedAt) / 1000;
      setBotProgress(
        bots.map((b) => {
          const charsPerSec = (b.wpm * 5) / 60;
          const noise = 0.85 + Math.random() * 0.3;
          return Math.min(1, (charsPerSec * elapsed * noise) / text.length);
        }),
      );
    }, 200);
    return () => window.clearInterval(id);
  }, [countdown, bots, text]);

  // Record race once on finish
  useEffect(() => {
    if (metrics.isFinished && !recorded) {
      const playerProgress = 1;
      const won = bots.every((_, i) => botProgress[i] < playerProgress) ||
        botProgress.every((p) => p < 1);
      recordRace({ wpm: metrics.wpm, accuracy: metrics.accuracy, won });
      setRecorded(true);
    }
  }, [metrics.isFinished, recorded, metrics.wpm, metrics.accuracy, bots, botProgress]);

  const racers = useMemo(
    () => [
      { name: getStats().username, progress: metrics.progress, isPlayer: true, color: "cyan" as const },
      ...bots.map((b, i) => ({ name: b.name, progress: botProgress[i] ?? 0, color: b.color })),
    ],
    [bots, botProgress, metrics.progress],
  );

  const winner =
    metrics.isFinished &&
    bots.every((_, i) => (botProgress[i] ?? 0) < 1);

  function newRace() {
    const newText = getRandomText();
    setText(newText);
    reset(newText);
    setBots(generateBots());
    setBotProgress([0, 0, 0]);
    setRecorded(false);
    setCountdown(3);
  }

  return (
    <div className="min-h-screen">
      <SiteHeader />
      <main className="max-w-5xl mx-auto px-4 md:px-6 py-8 md:py-12 space-y-6">
        <div className="flex items-end justify-between gap-4">
          <div>
            <div className="text-xs uppercase tracking-widest text-neon-cyan">Live Race</div>
            <h1 className="font-display text-3xl md:text-4xl font-black">Grid Sprint</h1>
          </div>
          <button
            onClick={newRace}
            className="rounded-lg border border-border bg-surface/60 backdrop-blur px-4 py-2 text-sm font-semibold hover:bg-surface transition"
          >
            New Race
          </button>
        </div>

        <RaceTrack racers={racers} />
        <StatsBar
          wpm={metrics.wpm}
          accuracy={metrics.accuracy}
          progress={metrics.progress}
          elapsedSec={metrics.elapsedSec}
        />

        <div className="relative">
          <TypingDisplay text={state.text} input={state.input} />
          {countdown !== null && (
            <div className="absolute inset-0 flex items-center justify-center rounded-2xl bg-background/80 backdrop-blur-sm">
              <div className="font-display text-7xl md:text-9xl font-black text-gradient-primary animate-pulse">
                {countdown === 0 ? "GO!" : countdown}
              </div>
            </div>
          )}
        </div>

        <textarea
          ref={inputRef}
          value={state.input}
          onChange={(e) => handleChange(e.target.value)}
          disabled={countdown !== null || metrics.isFinished}
          onPaste={(e) => e.preventDefault()}
          spellCheck={false}
          autoComplete="off"
          className="w-full font-mono text-base rounded-xl border border-border bg-surface/60 backdrop-blur p-4 focus:outline-none focus:ring-2 focus:ring-primary/60 disabled:opacity-50"
          rows={3}
          placeholder={countdown !== null ? "Get ready..." : "Start typing here..."}
        />

        {metrics.isFinished && (
          <div className="rounded-2xl border border-border bg-gradient-to-br from-surface-2 to-surface p-8 text-center shadow-elevated">
            <div className="text-xs uppercase tracking-widest text-neon-cyan">
              {winner ? "Victory" : "Race Complete"}
            </div>
            <div className="font-display text-4xl md:text-5xl font-black mt-2">
              {metrics.wpm} <span className="text-muted-foreground text-2xl">WPM</span>
            </div>
            <div className="text-muted-foreground mt-1">
              {metrics.accuracy.toFixed(1)}% accuracy · {metrics.elapsedSec.toFixed(1)}s
            </div>
            <button
              onClick={newRace}
              className="mt-6 rounded-xl bg-gradient-primary text-primary-foreground font-bold px-6 py-3 glow-cyan hover:opacity-90 transition"
            >
              Race Again →
            </button>
          </div>
        )}
      </main>
    </div>
  );
}

function generateBots(): Bot[] {
  const pool = [
    "NeonShark", "QuantumKey", "VoltageQueen", "ByteRunner", "GlitchPilot",
    "PulseDriver", "ChromeFury", "SynthRider", "HexBlaze", "EchoNova",
  ];
  const colors: Bot["color"][] = ["magenta", "lime", "amber"];
  const shuffled = [...pool].sort(() => Math.random() - 0.5);
  return [0, 1, 2].map((i) => ({
    name: shuffled[i],
    wpm: 45 + Math.floor(Math.random() * 60),
    color: colors[i],
  }));
}
