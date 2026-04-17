interface Racer {
  name: string;
  progress: number; // 0..1
  isPlayer?: boolean;
  color: "cyan" | "magenta" | "lime" | "amber";
}

interface Props {
  racers: Racer[];
}

export function RaceTrack({ racers }: Props) {
  return (
    <div className="rounded-2xl border border-border bg-surface/60 backdrop-blur p-4 md:p-6 shadow-elevated overflow-hidden relative">
      <div className="absolute inset-0 grid-bg opacity-40 pointer-events-none" />
      <div className="relative space-y-3">
        {racers.map((r, i) => (
          <Lane key={i} racer={r} />
        ))}
      </div>
    </div>
  );
}

function Lane({ racer }: { racer: Racer }) {
  const colorClass =
    racer.color === "cyan"
      ? "text-neon-cyan"
      : racer.color === "magenta"
        ? "text-neon-magenta"
        : racer.color === "lime"
          ? "text-neon-lime"
          : "text-neon-amber";
  const glow =
    racer.color === "cyan"
      ? "drop-shadow(0 0 8px oklch(0.85 0.18 200 / 0.9))"
      : racer.color === "magenta"
        ? "drop-shadow(0 0 8px oklch(0.72 0.27 330 / 0.9))"
        : racer.color === "lime"
          ? "drop-shadow(0 0 8px oklch(0.9 0.22 130 / 0.9))"
          : "drop-shadow(0 0 8px oklch(0.84 0.18 75 / 0.9))";

  return (
    <div className="relative h-12 rounded-lg bg-background/50 border border-border/60 overflow-hidden">
      <div className="absolute inset-y-0 left-0 right-0 flex items-center px-3 text-xs uppercase tracking-widest text-muted-foreground/70">
        <span className="font-mono">{racer.name}</span>
        {racer.isPlayer && (
          <span className="ml-2 px-1.5 py-0.5 rounded bg-primary/20 text-primary text-[10px]">YOU</span>
        )}
        <span className="ml-auto font-mono">{Math.round(racer.progress * 100)}%</span>
      </div>
      <div
        className="absolute top-1/2 -translate-y-1/2 transition-[left] duration-200 ease-linear text-2xl"
        style={{ left: `calc(${Math.min(racer.progress, 1) * 92}% + 4px)`, filter: glow }}
      >
        <span className={colorClass}>▶</span>
      </div>
      <div className="absolute right-2 top-0 bottom-0 w-0.5 bg-gradient-to-b from-transparent via-foreground/40 to-transparent" />
    </div>
  );
}
