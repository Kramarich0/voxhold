import { HashIcon, SpeakerHighIcon } from "@phosphor-icons/react";
import type { ComponentProps, ReactNode } from "react";
import { cn } from "@/shared/lib/cn";
import { SidebarMenuButton } from "@/shared/ui/core/sidebar";
import { Skeleton } from "@/shared/ui/core/skeleton";
import type { Channel } from "../model/channel.types";

type Props = ComponentProps<typeof SidebarMenuButton> & {
  channel: Channel;
  isActive?: boolean;
  hasUnread?: boolean;
  actions?: ReactNode;
};

export function ChannelItem({
  channel,
  isActive = false,
  hasUnread = false,
  actions,
  className,
  ...props
}: Props) {
  const isVoice = channel.kind === "voice";
  const showUnreadStyle = hasUnread && !isActive;

  return (
    <div className="group/channel relative flex items-center w-full">
      {showUnreadStyle && (
        <span className="absolute -left-1.5 top-1/2 -translate-y-1/2 size-1.5 rounded-full bg-foreground" />
      )}
      <SidebarMenuButton
        isActive={isActive}
        className={cn(
          "text-muted-foreground h-7 w-full justify-start group-hover/channel:bg-sidebar-accent",
          actions && "pr-14",
          className,
        )}
        {...props}
      >
        {isVoice ? <SpeakerHighIcon /> : <HashIcon />}
        <span className="truncate">{channel.name}</span>
      </SidebarMenuButton>

      {actions && <div className="absolute right-1 flex items-center z-10">{actions}</div>}
    </div>
  );
}

export function ChannelItemSkeleton({ className }: { className?: string }) {
  return (
    <div
      data-slot="channel-item-skeleton"
      className={cn("flex h-7 w-full items-center gap-2 px-2", className)}
    >
      <Skeleton className="size-4 shrink-0 rounded-xs" />
      <Skeleton className="h-3 w-28 rounded-xs" />
    </div>
  );
}
