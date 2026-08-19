import { HashIcon, SpeakerHighIcon } from "@phosphor-icons/react";
import type { ComponentProps, ReactNode } from "react";
import type { Channel } from "@/entities/channel/model/channel.types";
import { cn } from "@/shared/lib/cn";

type ChatHeaderRootProps = ComponentProps<"header"> & {
  children: ReactNode;
};

function ChatHeaderRoot({ className, children, ...props }: ChatHeaderRootProps) {
  return (
    <header
      className={cn(
        "flex h-12 shrink-0 items-center justify-between border-b border-border/40 px-4 bg-background select-none",
        className,
      )}
      {...props}
    >
      {children}
    </header>
  );
}

type ChatHeaderInfoProps = {
  channel: Channel;
  topic?: string;
};

function ChatHeaderInfo({ channel, topic }: ChatHeaderInfoProps) {
  const isVoice = channel.kind === "voice";

  return (
    <div className="flex items-center gap-2 min-w-0">
      <span className="text-muted-foreground shrink-0">
        {isVoice ? <SpeakerHighIcon /> : <HashIcon />}
      </span>
      <h2 className="truncate text-sm font-bold text-foreground">{channel.name}</h2>
      {topic && (
        <>
          <span className="text-border/60 font-light mx-1">|</span>
          <span className="truncate text-xs text-muted-foreground">{topic}</span>
        </>
      )}
    </div>
  );
}

function ChatHeaderActions({ className, children, ...props }: ComponentProps<"div">) {
  return (
    <div className={cn("flex items-center gap-1 shrink-0", className)} {...props}>
      {children}
    </div>
  );
}

export const ChatHeader = Object.assign(ChatHeaderRoot, {
  Info: ChatHeaderInfo,
  Actions: ChatHeaderActions,
});
