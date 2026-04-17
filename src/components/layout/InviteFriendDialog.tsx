import { useNavigate } from "@tanstack/react-router";
import { Check, Copy } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { copyTextToClipboard } from "@/lib/clipboard";
import { generateRoomId, ROOM_CODE_PATTERN } from "@/lib/live-race";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** Current URL room (`/multiplayer/:id`). When set, dialog shows this id instead of generating a new one. */
  roomIdFromUrl?: string | null;
}

export function InviteFriendDialog({ open, onOpenChange, roomIdFromUrl = null }: Props) {
  const navigate = useNavigate();
  const [roomId, setRoomId] = useState("");
  const [joinCode, setJoinCode] = useState("");
  const [copied, setCopied] = useState<"code" | "link" | null>(null);

  useEffect(() => {
    if (!open) return;
    setJoinCode("");
    setCopied(null);
    if (roomIdFromUrl && ROOM_CODE_PATTERN.test(roomIdFromUrl)) {
      setRoomId(roomIdFromUrl);
    } else {
      setRoomId(generateRoomId());
    }
  }, [open, roomIdFromUrl]);

  const inviteUrl = useMemo(() => {
    if (typeof window === "undefined" || !roomId) return "";
    return `${window.location.origin}/multiplayer/${encodeURIComponent(roomId)}`;
  }, [roomId]);

  async function copyText(label: "code" | "link", text: string) {
    const ok = await copyTextToClipboard(text);
    if (ok) {
      setCopied(label);
      window.setTimeout(() => setCopied(null), 2000);
    }
  }

  function goToMyRoom() {
    if (!roomId) return;
    onOpenChange(false);
    if (roomIdFromUrl === roomId) return;
    navigate({ to: "/multiplayer/$roomId", params: { roomId } });
  }

  function joinFriendRoom() {
    const code = joinCode.trim();
    if (!ROOM_CODE_PATTERN.test(code)) return;
    onOpenChange(false);
    navigate({ to: "/multiplayer/$roomId", params: { roomId: code } });
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md border-border bg-background">
        <DialogHeader>
          <DialogTitle className="font-display text-xl">Invite a friend</DialogTitle>
          <DialogDescription>
            Share the <strong>room code</strong> or full link with your friend. Same code = same lobby — both
            press <strong>Ready</strong> when connected.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-2">
          <div className="space-y-2">
            <Label htmlFor="invite-room-code">Room code</Label>
            <div className="flex gap-2">
              <Input
                id="invite-room-code"
                readOnly
                value={roomId}
                className="font-mono text-base tracking-wide"
              />
              <Button
                type="button"
                variant="outline"
                size="icon"
                className="shrink-0"
                onClick={() => roomId && copyText("code", roomId)}
                aria-label="Copy room code"
              >
                {copied === "code" ? <Check className="text-neon-lime" /> : <Copy />}
              </Button>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="invite-link">Invite link</Label>
            <div className="flex gap-2">
              <Input
                id="invite-link"
                readOnly
                value={inviteUrl}
                className="font-mono text-xs md:text-sm"
              />
              <Button
                type="button"
                variant="outline"
                size="icon"
                className="shrink-0"
                onClick={() => inviteUrl && copyText("link", inviteUrl)}
                aria-label="Copy invite link"
              >
                {copied === "link" ? <Check className="text-neon-lime" /> : <Copy />}
              </Button>
            </div>
          </div>

          <div className="rounded-xl border border-border/60 bg-surface/40 px-3 py-2 text-xs text-muted-foreground">
            Friend ya tum dono isi code wale URL par aao — phir{" "}
            <span className="text-foreground font-medium">Ready</span> dabao jab dono ho jayein.
          </div>

          <div className="space-y-2 pt-1 border-t border-border/60">
            <Label htmlFor="join-code-input">Friend ke paas code hai?</Label>
            <div className="flex gap-2">
              <Input
                id="join-code-input"
                placeholder="Room code paste karo"
                value={joinCode}
                onChange={(e) => setJoinCode(e.target.value.trim())}
                className="font-mono"
                onKeyDown={(e) => {
                  if (e.key === "Enter") joinFriendRoom();
                }}
              />
              <Button
                type="button"
                variant="secondary"
                className="shrink-0"
                disabled={!ROOM_CODE_PATTERN.test(joinCode.trim())}
                onClick={joinFriendRoom}
              >
                Join
              </Button>
            </div>
          </div>
        </div>

        <DialogFooter className="flex-col-reverse gap-2 sm:flex-row sm:justify-between">
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
            Close
          </Button>
          <Button type="button" className="glow-cyan bg-gradient-primary text-primary-foreground" onClick={goToMyRoom}>
            {roomIdFromUrl === roomId && roomId ? "Done" : "Open room →"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
