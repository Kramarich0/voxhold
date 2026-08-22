import { WarningIcon } from "@phosphor-icons/react";
import type { FormEvent, SubmitEvent } from "react";
import type { ServerMember } from "@/entities/server/model/server.types";
import { RoleBadge } from "@/entities/server/ui/role-badge";
import { getInitials } from "@/shared/lib/get-initials";
import { Button } from "@/shared/ui/core/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/shared/ui/core/dialog";
import { AppAvatar } from "@/shared/ui/kit/app-avatar";
import { LoadingButton } from "@/shared/ui/kit/loading-button";
import { useBanMemberMutation } from "../api/server.mutations";

type Props = {
  serverId: number;
  member: ServerMember | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export function BanMemberDialog({ serverId, member, open, onOpenChange }: Props) {
  const banMember = useBanMemberMutation(serverId);

  if (member == null) return null;

  const initials = getInitials(member.username);

  const handleBan = (event: SubmitEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (banMember.isPending) return;

    banMember.mutate(
      { userId: member.user_id, username: member.username },
      {
        onSuccess: () => {
          onOpenChange(false);
        },
      },
    );
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <div className="flex items-center gap-2 text-destructive mb-1">
            <WarningIcon className="size-5" />
            <DialogTitle>Ban Member</DialogTitle>
          </div>
          <DialogDescription>
            Are you sure you want to ban this user? They will be immediately disconnected, their
            sessions terminated, and they will not be able to rejoin.
          </DialogDescription>
        </DialogHeader>

        <div className="flex items-center gap-3 p-3 rounded-lg border bg-muted/30">
          <AppAvatar name={initials} size="default" />
          <div className="flex flex-col min-w-0">
            <div className="flex items-center gap-2">
              <span className="font-semibold text-xs text-foreground truncate">
                @{member.username}
              </span>
              <RoleBadge role={member.role} />
            </div>
          </div>
        </div>

        <form onSubmit={handleBan}>
          <DialogFooter className="mt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={banMember.isPending}
            >
              Cancel
            </Button>
            <LoadingButton type="submit" variant="destructive" isLoading={banMember.isPending}>
              Ban User
            </LoadingButton>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
