interface Props {
  wpm: number;
  accuracy: number;
  progress: number;
  elapsedSec: number;
}

export function StatsBar({ wpm, accuracy, progress, elapsedSec }: Props) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
      <Stat label="WPM" value={wpm.toString()} accent="cyan" />
      <Stat label="Accuracy" value={`${accuracy.toFixed(1)}%`} accent="magenta" />
      <Stat label="Progress" value={`${Math.round(progress * 100)}%`} accent="lime" />
      <Stat label="Time" value={`${elapsedSec.toFixed(1)}s`} accent="amber" />
    </div>
  );
}

function Stat({
  label,
  value,
  accent,
}: {
  label: string;
  value: string;
  accent: "cyan" | "magenta" | "lime" | "amber";
}) {
  const color =
    accent === "cyan"
      ? "text-neon-cyan text-glow-cyan"
      : accent === "magenta"
        ? "text-neon-magenta text-glow-magenta"
        : accent === "lime"
          ? "text-neon-lime"
          : "text-neon-amber";
  return (
    <div className="rounded-xl border border-border bg-surface/60 backdrop-blur px-4 py-3">
      <div className="text-xs uppercase tracking-widest text-muted-foreground">{label}</div>
      <div className={"font-display text-2xl md:text-3xl font-bold mt-1 " + color}>{value}</div>
    </div>
  );
}
