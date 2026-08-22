import { BellIcon, CheckIcon, EnvelopeSimpleIcon, XIcon } from "@phosphor-icons/react";
import { useState } from "react";
import { useIncomingInvitesQuery } from "@/entities/invite/api/invite.queries";
import type { IncomingInvite } from "@/shared/api/ws-client";
import { formatShortDateTime } from "@/shared/lib/date";
import { Badge } from "@/shared/ui/core/badge";
import { Button } from "@/shared/ui/core/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/shared/ui/core/popover";
import { ScrollArea } from "@/shared/ui/core/scroll-area";
import { AppAvatar } from "@/shared/ui/kit/app-avatar";
import { AppTooltip } from "@/shared/ui/kit/app-tooltip";
import { EmptyState } from "@/shared/ui/kit/empty-state";
import { LoadingButton } from "@/shared/ui/kit/loading-button";
import { useAcceptInviteMutation, useDeclineInviteMutation } from "../api/invite.mutations";

export function IncomingInvitesPopover() {
  const [open, setOpen] = useState(false);
  const { data: invites = [] } = useIncomingInvitesQuery();

  const pendingCount = invites.length;

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger
        render={
          <div className="relative inline-flex">
            <AppTooltip content="Server Invitations" side="bottom">
              <Button
                variant="ghost"
                size="icon-lg"
                className="text-muted-foreground hover:text-foreground relative"
                aria-label="Invitations"
              >
                <BellIcon />
                {pendingCount > 0 && (
                  <Badge
                    variant="default"
                    className="absolute -top-1 -right-1 h-4 min-w-4 px-1 text-3xs bg-primary text-primary-foreground font-bold"
                  >
                    {pendingCount}
                  </Badge>
                )}
              </Button>
            </AppTooltip>
          </div>
        }
      />

      <PopoverContent align="end" className="w-80 p-0 overflow-hidden bg-popover border">
        <div className="flex items-center justify-between border-b px-3 py-2">
          <div className="flex items-center gap-1.5 font-semibold text-xs text-foreground">
            <EnvelopeSimpleIcon className="size-4" />
            <span>Invitations</span>
          </div>
          {pendingCount > 0 && (
            <span className="text-2xs text-muted-foreground">{pendingCount} pending</span>
          )}
        </div>

        <ScrollArea className="max-h-72">
          {invites.length === 0 ? (
            <EmptyState
              size="sm"
              icon={<BellIcon className="size-4" />}
              title="No invitations"
              description="You have no pending server invites."
              className="py-6"
            />
          ) : (
            <div className="flex flex-col divide-y divide-border/40">
              {invites.map((invite) => (
                <InviteItemRow key={invite.id} invite={invite} />
              ))}
            </div>
          )}
        </ScrollArea>
      </PopoverContent>
    </Popover>
  );
}

function InviteItemRow({ invite }: { invite: IncomingInvite }) {
  const acceptInvite = useAcceptInviteMutation();
  const declineInvite = useDeclineInviteMutation();

  const isPending = acceptInvite.isPending || declineInvite.isPending;

  return (
    <div className="flex flex-col gap-2 p-3 hover:bg-muted/30 transition-colors">
      <div className="flex items-center gap-2.5">
        <AppAvatar name={invite.server_name} size="default" />
        <div className="flex flex-col min-w-0 flex-1">
          <span className="text-xs font-semibold text-foreground truncate">
            {invite.server_name}
          </span>
          <span className="text-2xs text-muted-foreground">
            Invited by{" "}
            <span className="font-medium text-foreground">@{invite.inviter_username}</span>
          </span>
          <span className="text-3xs text-muted-foreground mt-0.5">
            Expires {formatShortDateTime(invite.expires_at)}
          </span>
        </div>
      </div>

      <div className="flex items-center justify-end gap-2 mt-1">
        <Button
          variant="outline"
          size="xs"
          disabled={isPending}
          onClick={() => declineInvite.mutate(invite.id)}
          className="h-6 text-xs text-muted-foreground hover:text-destructive"
        >
          <XIcon /> Decline
        </Button>
        <LoadingButton
          variant="default"
          size="xs"
          isLoading={acceptInvite.isPending}
          disabled={isPending}
          onClick={() => acceptInvite.mutate(invite)}
          className="h-6 text-xs"
        >
          <CheckIcon /> Accept
        </LoadingButton>
      </div>
    </div>
  );
}
