import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { SiteHeader } from "@/components/layout/SiteHeader";
import { getStats, levelFromXp, setUsername, type PlayerStats } from "@/lib/storage";

export const Route = createFileRoute("/profile")({
  head: () => ({
    meta: [
      { title: "Profile — Velocity Typing" },
      { name: "description", content: "Your typing stats, XP and progression." },
      { property: "og:title", content: "Profile — Velocity Typing" },
      { property: "og:description", content: "Track your typing journey." },
    ],
  }),
  component: ProfilePage,
});

function ProfilePage() {
  const [stats, setStats] = useState<PlayerStats | null>(null);
  const [name, setName] = useState("");

  useEffect(() => {
    const s = getStats();
    setStats(s);
    setName(s.username);
  }, []);

  if (!stats) return null;
  const lvl = levelFromXp(stats.xp);
  const avgWpm =
    stats.racesCompleted > 0 ? Math.round(stats.totalWpm / stats.racesCompleted) : 0;
  const winRate =
    stats.racesCompleted > 0 ? Math.round((stats.racesWon / stats.racesCompleted) * 100) : 0;

  function saveName() {
    setUsername(name);
    setStats(getStats());
  }

  return (
    <div className="min-h-screen">
      <SiteHeader />
      <main className="max-w-4xl mx-auto px-4 md:px-6 py-8 md:py-12 space-y-6">
        <div className="rounded-3xl border border-border bg-gradient-to-br from-surface-2 to-surface p-8 shadow-elevated relative overflow-hidden">
          <div className="absolute inset-0 grid-bg opacity-30" />
          <div className="relative flex flex-col md:flex-row gap-6 items-start md:items-center">
            <div className="h-24 w-24 rounded-2xl bg-gradient-primary glow-cyan flex items-center justify-center font-display text-4xl font-black text-primary-foreground">
              {stats.username.slice(0, 1).toUpperCase()}
            </div>
            <div className="flex-1 w-full">
              <div className="flex flex-wrap items-baseline gap-3">
                <input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  onBlur={saveName}
                  onKeyDown={(e) => e.key === "Enter" && (e.target as HTMLInputElement).blur()}
                  className="font-display text-2xl md:text-3xl font-black bg-transparent border-b border-transparent hover:border-border focus:border-primary outline-none"
                />
                <span className="px-2 py-0.5 rounded-md bg-primary/20 text-primary text-xs font-semibold">
                  LV {lvl.level}
                </span>
              </div>
              <div className="mt-3">
                <div className="h-2 rounded-full bg-background/60 overflow-hidden">
                  <div
                    className="h-full bg-gradient-primary glow-cyan transition-all"
                    style={{ width: `${(lvl.progress / lvl.nextXp) * 100}%` }}
                  />
                </div>
                <div className="text-xs text-muted-foreground mt-1.5 font-mono">
                  {lvl.progress} / {lvl.nextXp} XP
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <ProfStat label="Best WPM" value={stats.bestWpm.toString()} color="cyan" />
          <ProfStat label="Best Acc" value={`${stats.bestAccuracy.toFixed(1)}%`} color="magenta" />
          <ProfStat label="Avg WPM" value={avgWpm.toString()} color="lime" />
          <ProfStat label="Win Rate" value={`${winRate}%`} color="amber" />
        </div>

        <div className="rounded-2xl border border-border bg-surface/60 backdrop-blur p-6">
          <h2 className="font-display text-xl font-bold">Career</h2>
          <div className="mt-3 grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
            <div>
              <div className="text-muted-foreground text-xs uppercase tracking-widest">Races</div>
              <div className="font-display text-2xl font-bold">{stats.racesCompleted}</div>
            </div>
            <div>
              <div className="text-muted-foreground text-xs uppercase tracking-widest">Wins</div>
              <div className="font-display text-2xl font-bold">{stats.racesWon}</div>
            </div>
            <div>
              <div className="text-muted-foreground text-xs uppercase tracking-widest">XP</div>
              <div className="font-display text-2xl font-bold">{stats.xp}</div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

function ProfStat({
  label,
  value,
  color,
}: {
  label: string;
  value: string;
  color: "cyan" | "magenta" | "lime" | "amber";
}) {
  const c =
    color === "cyan"
      ? "text-neon-cyan text-glow-cyan"
      : color === "magenta"
        ? "text-neon-magenta text-glow-magenta"
        : color === "lime"
          ? "text-neon-lime"
          : "text-neon-amber";
  return (
    <div className="rounded-xl border border-border bg-surface/60 backdrop-blur p-4">
      <div className="text-xs uppercase tracking-widest text-muted-foreground">{label}</div>
      <div className={"font-display text-3xl font-bold mt-1 " + c}>{value}</div>
    </div>
  );
}
