import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { SiteHeader } from "@/components/layout/SiteHeader";
import { TypingDisplay } from "@/components/typing/TypingDisplay";
import { StatsBar } from "@/components/typing/StatsBar";
import { useTypingEngine } from "@/hooks/use-typing-engine";
import { getRandomText } from "@/lib/typing-texts";
import { recordRace } from "@/lib/storage";

export const Route = createFileRoute("/practice")({
  head: () => ({
    meta: [
      { title: "Practice — Velocity Typing" },
      { name: "description", content: "Solo typing practice. Drill speed and accuracy at your own pace." },
      { property: "og:title", content: "Practice — Velocity Typing" },
      { property: "og:description", content: "Drill, refine, repeat." },
    ],
  }),
  component: PracticePage,
});

function PracticePage() {
  const [text, setText] = useState(() => getRandomText());
  const [recorded, setRecorded] = useState(false);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const { state, metrics, handleChange, reset } = useTypingEngine(text);

  useEffect(() => {
    inputRef.current?.focus();
  }, [text]);

  useEffect(() => {
    if (metrics.isFinished && !recorded) {
      recordRace({ wpm: metrics.wpm, accuracy: metrics.accuracy, won: false });
      setRecorded(true);
    }
  }, [metrics.isFinished, metrics.wpm, metrics.accuracy, recorded]);

  function next() {
    const t = getRandomText();
    setText(t);
    reset(t);
    setRecorded(false);
  }

  return (
    <div className="min-h-screen">
      <SiteHeader />
      <main className="max-w-5xl mx-auto px-4 md:px-6 py-8 md:py-12 space-y-6">
        <div className="flex items-end justify-between gap-4">
          <div>
            <div className="text-xs uppercase tracking-widest text-neon-magenta">Solo Drill</div>
            <h1 className="font-display text-3xl md:text-4xl font-black">Practice</h1>
          </div>
          <button
            onClick={next}
            className="rounded-lg border border-border bg-surface/60 backdrop-blur px-4 py-2 text-sm font-semibold hover:bg-surface transition"
          >
            New Text
          </button>
        </div>

        <StatsBar
          wpm={metrics.wpm}
          accuracy={metrics.accuracy}
          progress={metrics.progress}
          elapsedSec={metrics.elapsedSec}
        />
        <TypingDisplay text={state.text} input={state.input} />

        <textarea
          ref={inputRef}
          value={state.input}
          onChange={(e) => handleChange(e.target.value)}
          disabled={metrics.isFinished}
          onPaste={(e) => e.preventDefault()}
          spellCheck={false}
          autoComplete="off"
          className="w-full font-mono text-base rounded-xl border border-border bg-surface/60 backdrop-blur p-4 focus:outline-none focus:ring-2 focus:ring-primary/60 disabled:opacity-50"
          rows={3}
          placeholder="Start typing..."
        />

        {metrics.isFinished && (
          <div className="rounded-2xl border border-border bg-gradient-to-br from-surface-2 to-surface p-8 text-center shadow-elevated">
            <div className="text-xs uppercase tracking-widest text-neon-magenta">Run Complete</div>
            <div className="font-display text-4xl md:text-5xl font-black mt-2">
              {metrics.wpm} <span className="text-muted-foreground text-2xl">WPM</span>
            </div>
            <div className="text-muted-foreground mt-1">
              {metrics.accuracy.toFixed(1)}% accuracy · {metrics.elapsedSec.toFixed(1)}s
            </div>
            <button
              onClick={next}
              className="mt-6 rounded-xl bg-gradient-primary text-primary-foreground font-bold px-6 py-3 glow-magenta hover:opacity-90 transition"
            >
              Next Text →
            </button>
          </div>
        )}
      </main>
    </div>
  );
}
