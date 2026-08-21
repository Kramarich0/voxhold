import { XIcon } from "@phosphor-icons/react";
import type { ComponentProps } from "react";
import { cn } from "@/shared/lib/cn";
import { formatShortDateTime } from "@/shared/lib/date";
import { getInitials } from "@/shared/lib/get-initials";
import { Button } from "@/shared/ui/core/button";
import { Card } from "@/shared/ui/core/card";
import { Skeleton } from "@/shared/ui/core/skeleton";
import { AppAvatar } from "@/shared/ui/kit/app-avatar";
import { AppTooltip } from "@/shared/ui/kit/app-tooltip";
import type { PinnedMessage } from "../model/message.types";

type Props = ComponentProps<typeof Card> & {
  pin: PinnedMessage;
  onUnpin?: () => void;
};

export function PinnedMessageCard({ pin, onUnpin, className, onClick, ...props }: Props) {
  const initials = getInitials(pin.message.author.username);

  return (
    <Card
      size="sm"
      onClick={onClick}
      className={cn(
        "group/pin relative flex flex-col gap-1.5 rounded-md p-2.5 transition-colors cursor-pointer",
        "hover:bg-muted/50 select-none ring-0",
        className,
      )}
      {...props}
    >
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2 min-w-0">
          <AppAvatar name={initials} size="sm" />
          <span className="text-xs font-semibold truncate text-foreground">
            {pin.message.author.username}
          </span>
        </div>

        <div className="flex items-center gap-1">
          <span className="text-3xs text-muted-foreground tabular-nums">
            {formatShortDateTime(pin.message.created_at)}
          </span>

          {onUnpin && (
            <AppTooltip content="Unpin Message">
              <Button
                variant="ghost"
                size="icon-xs"
                className="opacity-0 group-hover/pin:opacity-100 text-muted-foreground hover:text-destructive size-5"
                onClick={(e) => {
                  e.stopPropagation();
                  onUnpin();
                }}
              >
                <XIcon className="size-3" />
              </Button>
            </AppTooltip>
          )}
        </div>
      </div>

      <p className="text-xs leading-relaxed text-foreground wrap-break-word line-clamp-3">
        {pin.message.content}
      </p>
    </Card>
  );
}

export function PinnedMessageCardSkeleton({ className }: { className?: string }) {
  return (
    <Card
      size="sm"
      className={cn(
        "flex flex-row items-center gap-2.5 rounded-md border-none px-2 py-2 ring-0 bg-transparent",
        className,
      )}
    >
      <Skeleton className="size-8 rounded-full shrink-0" />
      <div className="flex flex-col gap-1.5 flex-1 min-w-0">
        <Skeleton className="h-3 w-24 rounded-xs" />
        <Skeleton className="h-4 w-full rounded-xs" />
      </div>
    </Card>
  );
}
