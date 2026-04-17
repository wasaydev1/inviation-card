interface Props {
  text: string;
  input: string;
}

export function TypingDisplay({ text, input }: Props) {
  return (
    <div className="font-mono text-xl md:text-2xl leading-relaxed tracking-wide select-none rounded-2xl border border-border bg-surface/60 p-6 md:p-8 shadow-elevated backdrop-blur">
      {text.split("").map((ch, i) => {
        const typed = i < input.length;
        const correct = typed && input[i] === ch;
        const incorrect = typed && input[i] !== ch;
        const current = i === input.length;
        return (
          <span
            key={i}
            className={
              "transition-colors " +
              (correct
                ? "text-neon-cyan text-glow-cyan"
                : incorrect
                  ? "text-destructive bg-destructive/20 rounded-sm"
                  : current
                    ? "text-foreground bg-accent/30 rounded-sm animate-pulse"
                    : "text-muted-foreground")
            }
          >
            {ch}
          </span>
        );
      })}
    </div>
  );
}
