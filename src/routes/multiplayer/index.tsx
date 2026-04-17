import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { SiteHeader } from "@/components/layout/SiteHeader";
import { generateRoomId } from "@/lib/live-race";

export const Route = createFileRoute("/multiplayer/")({
  head: () => ({
    meta: [
      { title: "Friend Race — Velocity Typing" },
      {
        name: "description",
        content: "Create a room and invite a friend for a live 1v1 typing race.",
      },
    ],
  }),
  component: FriendRaceLobby,
});

function FriendRaceLobby() {
  const navigate = useNavigate();

  function createRoom() {
    const id = generateRoomId();
    navigate({ to: "/multiplayer/$roomId", params: { roomId: id } });
  }

  return (
    <div className="min-h-screen">
      <SiteHeader />
      <main className="max-w-2xl mx-auto px-4 md:px-6 py-12 md:py-16 space-y-8">
        <div>
          <div className="text-xs uppercase tracking-widest text-neon-lime">Multiplayer</div>
          <h1 className="font-display text-3xl md:text-4xl font-black mt-2">Race a friend</h1>
          <p className="text-muted-foreground mt-3">
            Create a private room, copy the invite link, and both hit <strong>Ready</strong> when you&apos;re set.
            Same passage, synced countdown — first to finish wins.
          </p>
        </div>

        <div className="rounded-2xl border border-border bg-surface/60 backdrop-blur p-8 shadow-elevated space-y-6">
          <button
            type="button"
            onClick={createRoom}
            className="w-full rounded-xl bg-gradient-primary text-primary-foreground font-bold px-6 py-4 glow-cyan hover:opacity-90 transition text-lg"
          >
            Create invite link →
          </button>
          <p className="text-sm text-muted-foreground text-center">
            Opens a room with a shareable URL (1v1, two typists max).
          </p>
        </div>

        <div className="flex flex-wrap gap-3 justify-center text-sm">
          <Link to="/race" className="text-primary font-semibold hover:underline">
            vs AI Grid Sprint
          </Link>
          <span className="text-muted-foreground">·</span>
          <Link to="/practice" className="text-primary font-semibold hover:underline">
            Solo practice
          </Link>
        </div>
      </main>
    </div>
  );
}
