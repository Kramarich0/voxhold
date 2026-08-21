import type { ComponentProps } from "react";
import { cn } from "@/shared/lib/cn";
import { formatLastSeen } from "@/shared/lib/date";
import { getInitials } from "@/shared/lib/get-initials";
import { Card } from "@/shared/ui/core/card";
import { Skeleton } from "@/shared/ui/core/skeleton";
import { AppAvatar } from "@/shared/ui/kit/app-avatar";
import { ROLE_DISPLAY_VARIANTS } from "../model/server.constants";
import type { ServerMember } from "../model/server.types";
import { RoleBadge } from "./role-badge";

type Props = ComponentProps<typeof Card> & {
  member: ServerMember;
  isOnline?: boolean;
};

export function MemberCard({ member, isOnline = false, className, ...props }: Props) {
  const initials = getInitials(member.username);
  const fallbackSubtitle = ROLE_DISPLAY_VARIANTS[member.role]?.label ?? "Member";

  const subtitle = member.about?.trim()
    ? member.about
    : isOnline
      ? fallbackSubtitle
      : formatLastSeen(member.last_seen_at);

  return (
    <Card
      size="sm"
      className={cn(
        "group/member flex flex-row items-center gap-2.5 rounded-md px-2 py-1.5 transition-colors hover:bg-muted/50 select-none cursor-pointer border-none ring-0 w-full",
        !isOnline && "opacity-60 hover:opacity-100",
        className,
      )}
      {...props}
    >
      <div className="relative shrink-0">
        <AppAvatar size="sm" name={initials} />
        <span
          className={cn(
            "absolute bottom-0 right-0 size-2 rounded-full ring-2 ring-background",
            isOnline ? "bg-success" : "bg-muted-foreground",
          )}
        />
      </div>

      <div className="flex flex-col min-w-0 flex-1">
        <div className="flex items-center gap-1.5">
          <span className="truncate text-xs font-medium text-foreground">{member.username}</span>
          <RoleBadge role={member.role} />
        </div>
        <span className="truncate text-2xs text-muted-foreground">{subtitle}</span>
      </div>
    </Card>
  );
}

export function MemberCardSkeleton({ className }: { className?: string }) {
  return (
    <div
      data-slot="member-card-skeleton"
      className={cn("flex flex-row items-center gap-2.5 rounded-md px-2 py-1.5", className)}
    >
      <Skeleton className="size-6 rounded-full shrink-0" />
      <div className="flex flex-col gap-1 flex-1 min-w-0">
        <Skeleton className="h-3 w-20 rounded-xs" />
        <Skeleton className="h-2.5 w-32 rounded-xs" />
      </div>
    </div>
  );
}
