import { createFileRoute, Link } from "@tanstack/react-router";
import { SiteHeader } from "@/components/layout/SiteHeader";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Velocity — Competitive Typing, Reimagined" },
      {
        name: "description",
        content:
          "Race friends, climb global leaderboards, and level up your typing speed in a neon-lit competitive arena.",
      },
      { property: "og:title", content: "Velocity — Competitive Typing, Reimagined" },
      {
        property: "og:description",
        content: "Race, level up, and dominate the global typing leaderboards.",
      },
    ],
  }),
  component: HomePage,
});

function HomePage() {
  return (
    <div className="min-h-screen">
      <SiteHeader />
      <main>
        <Hero />
        <Features />
        <ModesSection />
        <CTA />
        <Footer />
      </main>
    </div>
  );
}

function Hero() {
  return (
    <section className="relative overflow-hidden">
      <div className="absolute inset-0 grid-bg opacity-50 pointer-events-none" />
      <div className="max-w-7xl mx-auto px-4 md:px-6 py-20 md:py-32 relative">
        <div className="max-w-3xl">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-border bg-surface/60 backdrop-blur text-xs uppercase tracking-widest text-muted-foreground mb-6">
            <span className="h-1.5 w-1.5 rounded-full bg-neon-lime animate-pulse" />
            Season 1 — Now Live
          </div>
          <h1 className="font-display text-5xl md:text-7xl font-black leading-[1.05]">
            Type at the speed of{" "}
            <span className="text-gradient-primary">light.</span>
          </h1>
          <p className="mt-6 text-lg md:text-xl text-muted-foreground max-w-2xl">
            Velocity is a next-generation competitive typing arena. Race real opponents,
            climb global ladders, and unlock the keyboard hero you were born to be.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link
              to="/race"
              className="inline-flex items-center justify-center rounded-xl bg-gradient-primary text-primary-foreground font-bold px-6 py-3 glow-cyan hover:opacity-90 transition"
            >
              Start Racing →
            </Link>
            <Link
              to="/practice"
              className="inline-flex items-center justify-center rounded-xl border border-border bg-surface/60 backdrop-blur text-foreground font-semibold px-6 py-3 hover:bg-surface transition"
            >
              Practice Mode
            </Link>
          </div>
          <div className="mt-10 grid grid-cols-3 gap-4 max-w-md">
            <HeroStat n="120K+" label="Racers" />
            <HeroStat n="2.4M" label="Races" />
            <HeroStat n="180" label="Top WPM" />
          </div>
        </div>
      </div>
    </section>
  );
}

function HeroStat({ n, label }: { n: string; label: string }) {
  return (
    <div>
      <div className="font-display text-2xl md:text-3xl font-bold text-neon-cyan text-glow-cyan">{n}</div>
      <div className="text-xs uppercase tracking-widest text-muted-foreground mt-1">{label}</div>
    </div>
  );
}

function Features() {
  const items = [
    { title: "Real-time Racing", desc: "Sub-100ms position sync. Feel every keystroke.", color: "cyan" },
    { title: "ELO Matchmaking", desc: "Ranked seasons with fair, balanced opponents.", color: "magenta" },
    { title: "Adaptive AI Texts", desc: "Content that evolves with your skill ceiling.", color: "lime" },
    { title: "Anti-Cheat Engine", desc: "Bots and clipboard tricks don't stand a chance.", color: "amber" },
  ] as const;
  return (
    <section className="max-w-7xl mx-auto px-4 md:px-6 py-16 md:py-24">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {items.map((f) => (
          <div
            key={f.title}
            className="rounded-2xl border border-border bg-surface/50 backdrop-blur p-6 hover:border-primary/50 transition group"
          >
            <div
              className={
                "h-10 w-10 rounded-lg mb-4 " +
                (f.color === "cyan"
                  ? "bg-neon-cyan/20 text-neon-cyan"
                  : f.color === "magenta"
                    ? "bg-neon-magenta/20 text-neon-magenta"
                    : f.color === "lime"
                      ? "bg-neon-lime/20 text-neon-lime"
                      : "bg-neon-amber/20 text-neon-amber") +
                " flex items-center justify-center font-display font-black"
              }
            >
              ⚡
            </div>
            <h3 className="font-display text-lg font-bold">{f.title}</h3>
            <p className="text-sm text-muted-foreground mt-2">{f.desc}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

function ModesSection() {
  const modes = [
    { name: "Race", desc: "Head-to-head against bots and rivals.", to: "/race", tag: "Live" },
    {
      name: "Friend race",
      desc: "Invite a link and duel 1v1 with a synced countdown.",
      to: "/multiplayer",
      tag: "Invite",
    },
    { name: "Practice", desc: "Drill speed, accuracy, and consistency.", to: "/practice", tag: "Solo" },
    { name: "Leaderboard", desc: "Climb the global rankings.", to: "/leaderboard", tag: "Ranked" },
  ] as const;
  return (
    <section className="max-w-7xl mx-auto px-4 md:px-6 py-16 md:py-24">
      <div className="flex items-end justify-between mb-8">
        <h2 className="font-display text-3xl md:text-5xl font-black">Choose your mode.</h2>
      </div>
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {modes.map((m) => (
          <Link
            key={m.name}
            to={m.to}
            className="group rounded-2xl border border-border bg-gradient-to-br from-surface to-surface-2 p-6 hover:border-primary/60 hover:shadow-elevated transition relative overflow-hidden"
          >
            <div className="absolute -top-10 -right-10 h-32 w-32 rounded-full bg-gradient-primary opacity-20 blur-2xl group-hover:opacity-40 transition" />
            <div className="text-xs uppercase tracking-widest text-neon-cyan">{m.tag}</div>
            <div className="font-display text-3xl font-black mt-2">{m.name}</div>
            <p className="text-muted-foreground mt-2">{m.desc}</p>
            <div className="mt-6 inline-flex items-center text-primary font-semibold">
              Enter →
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}

function CTA() {
  return (
    <section className="max-w-7xl mx-auto px-4 md:px-6 py-16 md:py-24">
      <div className="rounded-3xl border border-border bg-gradient-to-br from-surface-2 to-surface p-10 md:p-16 text-center relative overflow-hidden shadow-elevated">
        <div className="absolute inset-0 grid-bg opacity-30" />
        <div className="relative">
          <h2 className="font-display text-3xl md:text-5xl font-black">
            Ready to <span className="text-gradient-primary">outrun</span> the keyboard?
          </h2>
          <p className="mt-4 text-muted-foreground max-w-xl mx-auto">
            No sign-up needed. Jump into your first race in under five seconds.
          </p>
          <Link
            to="/race"
            className="inline-flex items-center justify-center rounded-xl bg-gradient-primary text-primary-foreground font-bold px-8 py-4 mt-8 glow-magenta hover:opacity-90 transition"
          >
            Race Now →
          </Link>
        </div>
      </div>
    </section>
  );
}

function Footer() {
  return (
    <footer className="border-t border-border mt-16">
      <div className="max-w-7xl mx-auto px-4 md:px-6 py-8 text-sm text-muted-foreground flex flex-col md:flex-row gap-2 justify-between">
        <div>© {new Date().getFullYear()} Velocity Typing</div>
        <div>Built for speed.</div>
      </div>
    </footer>
  );
}
