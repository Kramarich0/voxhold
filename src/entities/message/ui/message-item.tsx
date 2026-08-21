import { PushPinIcon } from "@phosphor-icons/react";
import type { ComponentProps, ReactNode } from "react";
import { cn } from "@/shared/lib/cn";
import { formatFullDateTime, formatTime } from "@/shared/lib/date";
import { getInitials } from "@/shared/lib/get-initials";
import { Skeleton } from "@/shared/ui/core/skeleton";
import { AppAvatar } from "@/shared/ui/kit/app-avatar";
import { AppTooltip } from "@/shared/ui/kit/app-tooltip";
import type { Message } from "../model/message.types";

type Props = ComponentProps<"div"> & {
  message: Message;
  isPinned?: boolean;
  isEditing?: boolean;
  isCompact?: boolean;
  avatar?: ReactNode;
  author?: ReactNode;
  badge?: ReactNode;
  actions?: ReactNode;
  children?: ReactNode;
};

export function MessageItem({
  message,
  isPinned = false,
  isEditing = false,
  isCompact = false,
  avatar,
  author,
  badge,
  actions,
  children,
  className,
  ...props
}: Props) {
  const initials = getInitials(message.author.username);
  const timeFormatted = formatTime(message.created_at);
  const fullTimeFormatted = formatFullDateTime(message.created_at);

  return (
    <div
      className={cn(
        "group/message relative flex gap-3 px-4 transition-colors hover:bg-muted/50 select-text rounded-md",
        isCompact ? "py-0.5" : "pt-1.5 pb-1",
        className,
      )}
      {...props}
    >
      {isCompact ? (
        <div className="w-8 shrink-0 flex items-center justify-end select-none">
          <span className="text-2xs text-muted-foreground opacity-0 group-hover/message:opacity-100 transition-opacity tabular-nums cursor-default">
            <AppTooltip content={fullTimeFormatted}>{timeFormatted}</AppTooltip>
          </span>
        </div>
      ) : (
        (avatar ?? <AppAvatar name={initials} />)
      )}

      <div className="flex flex-col min-w-0 flex-1">
        {!isCompact && (
          <div className="flex items-center gap-2">
            {author ?? (
              <span className="text-xs font-semibold text-foreground tracking-tight hover:underline cursor-pointer">
                {message.author.username}
              </span>
            )}

            <div className="flex items-center gap-2 text-xs-tight text-muted-foreground tabular-nums select-none">
              <AppTooltip content={fullTimeFormatted}>{timeFormatted}</AppTooltip>
              {isPinned && <PushPinIcon className="size-3 text-warning" />}
            </div>
            {badge}
          </div>
        )}

        {isEditing ? (
          children
        ) : (
          <div className="text-xs leading-relaxed wrap-break-word pt-0.5">
            <span className="inline">
              {message.content}
              {message.edited_at != null && (
                <AppTooltip content={formatFullDateTime(message.edited_at)}>
                  <span className="text-2xs text-muted-foreground pl-1.5 select-none cursor-default">
                    (edited)
                  </span>
                </AppTooltip>
              )}
              {isPinned && isCompact && <PushPinIcon className="inline size-3 text-warning" />}
            </span>
          </div>
        )}
        {actions}
      </div>
    </div>
  );
}

export function MessageItemSkeleton({
  isCompact = false,
  className,
}: {
  isCompact?: boolean;
  className?: string;
}) {
  return (
    <div
      data-slot="message-item-skeleton"
      className={cn("flex gap-3 px-4 rounded-md", isCompact ? "py-1" : "pt-2 pb-1.5", className)}
    >
      {isCompact ? (
        <div className="w-8 shrink-0 flex justify-end">
          <Skeleton className="h-2.5 w-6 rounded-xs" />
        </div>
      ) : (
        <Skeleton className="size-8 rounded-full shrink-0" />
      )}

      <div className="flex flex-col min-w-0 flex-1 gap-1.5">
        {!isCompact && (
          <div className="flex items-center gap-2">
            <Skeleton className="h-3 w-20 rounded-xs" />
            <Skeleton className="h-2.5 w-10 rounded-xs" />
          </div>
        )}
        <Skeleton className={cn("h-3.5 rounded-xs", isCompact ? "w-3/5" : "w-4/5")} />
      </div>
    </div>
  );
}
