import { Link } from "@tanstack/react-router";
import { useInviteFriend } from "@/components/layout/InviteFriendContext";

export function SiteHeader() {
  const { openInvite } = useInviteFriend();

  return (
    <header className="sticky top-0 z-40 backdrop-blur-xl bg-background/70 border-b border-border">
      <div className="max-w-7xl mx-auto px-4 md:px-6 h-16 flex items-center gap-6">
        <Link to="/" className="flex items-center gap-2 font-display font-black text-lg">
          <span className="inline-block h-7 w-7 rounded-md bg-gradient-primary glow-cyan" />
          <span className="text-gradient-primary">VELOCITY</span>
        </Link>
        <nav className="hidden md:flex items-center gap-1 text-sm">
          <NavLink to="/race">Race</NavLink>
          <NavLink to="/multiplayer">Friend race</NavLink>
          <NavLink to="/practice">Practice</NavLink>
          <NavLink to="/leaderboard">Leaderboard</NavLink>
          <NavLink to="/profile">Profile</NavLink>
        </nav>
        <div className="ml-auto flex items-center gap-2">
          <button
            type="button"
            onClick={openInvite}
            className="hidden sm:inline-flex items-center justify-center rounded-lg border border-border bg-surface/60 backdrop-blur font-semibold px-4 py-2 text-sm hover:bg-surface transition"
          >
            Invite friend
          </button>
          <button
            type="button"
            onClick={openInvite}
            className="sm:hidden inline-flex items-center justify-center rounded-lg border border-border bg-surface/60 backdrop-blur font-semibold px-3 py-2 text-xs hover:bg-surface transition"
          >
            Invite
          </button>
          <Link
            to="/race"
            className="inline-flex items-center justify-center rounded-lg bg-gradient-primary text-primary-foreground font-semibold px-4 py-2 text-sm glow-cyan hover:opacity-90 transition"
          >
            Quick Race
          </Link>
        </div>
      </div>
    </header>
  );
}

function NavLink({ to, children }: { to: string; children: React.ReactNode }) {
  return (
    <Link
      to={to}
      className="px-3 py-2 rounded-md text-muted-foreground hover:text-foreground hover:bg-surface transition"
      activeProps={{ className: "px-3 py-2 rounded-md text-foreground bg-surface" }}
    >
      {children}
    </Link>
  );
}
