import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { SiteHeader } from "@/components/layout/SiteHeader";
import { getLeaderboard, type LeaderboardEntry } from "@/lib/storage";

export const Route = createFileRoute("/leaderboard")({
  head: () => ({
    meta: [
      { title: "Leaderboard — Velocity Typing" },
      { name: "description", content: "Global rankings of the world's fastest typists." },
      { property: "og:title", content: "Leaderboard — Velocity Typing" },
      { property: "og:description", content: "Climb the global ranks." },
    ],
  }),
  component: LeaderboardPage,
});

function LeaderboardPage() {
  const [entries, setEntries] = useState<LeaderboardEntry[]>([]);

  useEffect(() => {
    setEntries(getLeaderboard());
  }, []);

  return (
    <div className="min-h-screen">
      <SiteHeader />
      <main className="max-w-4xl mx-auto px-4 md:px-6 py-8 md:py-12 space-y-6">
        <div>
          <div className="text-xs uppercase tracking-widest text-neon-lime">Season 1</div>
          <h1 className="font-display text-3xl md:text-5xl font-black">Global Leaderboard</h1>
          <p className="text-muted-foreground mt-2">The fastest fingers on the grid.</p>
        </div>

        <div className="rounded-2xl border border-border bg-surface/60 backdrop-blur shadow-elevated overflow-hidden">
          <div className="grid grid-cols-12 gap-2 px-4 md:px-6 py-3 text-xs uppercase tracking-widest text-muted-foreground border-b border-border">
            <div className="col-span-1">#</div>
            <div className="col-span-6">Player</div>
            <div className="col-span-3 text-right">WPM</div>
            <div className="col-span-2 text-right">Acc</div>
          </div>
          <div className="divide-y divide-border">
            {entries.map((e, i) => {
              const rank = i + 1;
              const rankColor =
                rank === 1
                  ? "text-neon-amber text-glow-cyan"
                  : rank === 2
                    ? "text-neon-cyan"
                    : rank === 3
                      ? "text-neon-magenta"
                      : "text-muted-foreground";
              return (
                <div
                  key={i}
                  className="grid grid-cols-12 gap-2 px-4 md:px-6 py-3 items-center hover:bg-surface-2/50 transition"
                >
                  <div className={"col-span-1 font-display font-black " + rankColor}>{rank}</div>
                  <div className="col-span-6 font-mono">{e.username}</div>
                  <div className="col-span-3 text-right font-display font-bold text-neon-cyan">{e.wpm}</div>
                  <div className="col-span-2 text-right text-muted-foreground">{e.accuracy.toFixed(1)}%</div>
                </div>
              );
            })}
          </div>
        </div>
      </main>
    </div>
  );
}
