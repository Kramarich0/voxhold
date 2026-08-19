import { PushPinIcon } from "@phosphor-icons/react";
import { format } from "date-fns";
import type { ComponentProps, ReactNode } from "react";
import { cn } from "@/shared/lib/cn";
import { AppAvatar } from "@/shared/ui/kit/app-avatar";
import type { Message } from "../model/message.types";

type Props = ComponentProps<"div"> & {
  message: Message;
  isPinned?: boolean;
  badge?: ReactNode;
};

export function MessageItem({ message, isPinned = false, badge, className, ...props }: Props) {
  const initials = message.author.username.slice(0, 2).toUpperCase();
  const timeFormatted = format(new Date(message.created_at * 1000), "HH:mm");

  return (
    <div
      className={cn(
        "group/message flex gap-3 px-4 py-1.5 transition-colors hover:bg-muted/30 select-text rounded-md mx-2",
        isPinned && "bg-warning/5 border-l-2 border-warning/60",
        className,
      )}
      {...props}
    >
      <AppAvatar name={initials} />

      <div className="flex flex-col min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold text-foreground tracking-tight hover:underline cursor-pointer">
            {message.author.username}
          </span>

          {badge}

          <span className="text-xs-tight text-muted-foreground/70 tabular-nums select-none">
            {timeFormatted}
          </span>
        </div>

        {isPinned && (
          <div className="flex items-center gap-1 text-2xs font-semibold text-warning mt-0.5 uppercase tracking-wider select-none">
            <PushPinIcon className="size-3" />
            <span>Pinned</span>
          </div>
        )}

        <p className="text-xs leading-relaxed text-foreground/90 wrap-break-word mt-0.5">
          {message.content}
        </p>

        {message.edited_at != null && (
          <span className="text-3xs text-muted-foreground/60 mt-0.5 select-none">(edited)</span>
        )}
      </div>
    </div>
  );
}
