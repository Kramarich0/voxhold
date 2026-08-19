import { HashIcon, SpeakerHighIcon } from "@phosphor-icons/react";
import type { ComponentProps } from "react";
import { cn } from "@/shared/lib/cn";
import { SidebarMenuButton } from "@/shared/ui/core/sidebar";
import type { Channel } from "../model/channel.types";

type Props = ComponentProps<typeof SidebarMenuButton> & {
  channel: Channel;
  isActive?: boolean;
};

export function ChannelItem({ channel, isActive = false, className, ...props }: Props) {
  const isVoice = channel.kind === "voice";

  return (
    <SidebarMenuButton
      isActive={isActive}
      className={cn("text-muted-foreground h-7", className)}
      {...props}
    >
      {isVoice ? <SpeakerHighIcon /> : <HashIcon />}
      <span className="truncate">{channel.name}</span>
    </SidebarMenuButton>
  );
}
