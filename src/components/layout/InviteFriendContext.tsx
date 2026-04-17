import { useRouter } from "@tanstack/react-router";
import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from "react";
import { InviteFriendDialog } from "@/components/layout/InviteFriendDialog";
import { parseMultiplayerRoomFromPath } from "@/lib/live-race";

type Ctx = {
  openInvite: () => void;
};

const InviteFriendContext = createContext<Ctx | null>(null);

export function InviteFriendProvider({ children }: { children: ReactNode }) {
  const router = useRouter();
  const pathname = router.state.location.pathname;
  const roomIdFromUrl = useMemo(() => parseMultiplayerRoomFromPath(pathname), [pathname]);

  const [open, setOpen] = useState(false);
  const openInvite = useCallback(() => setOpen(true), []);

  const value = useMemo(() => ({ openInvite }), [openInvite]);

  return (
    <InviteFriendContext.Provider value={value}>
      {children}
      <InviteFriendDialog open={open} onOpenChange={setOpen} roomIdFromUrl={roomIdFromUrl} />
    </InviteFriendContext.Provider>
  );
}

export function useInviteFriend(): Ctx {
  const ctx = useContext(InviteFriendContext);
  if (!ctx) {
    throw new Error("useInviteFriend must be used within InviteFriendProvider");
  }
  return ctx;
}
