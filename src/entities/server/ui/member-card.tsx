import type { ComponentProps } from "react";
import { ROLE_DISPLAY_VARIANTS } from "@/entities/server/model/server.constants";
import type { ServerMember } from "@/entities/server/model/server.types";
import { RoleBadge } from "@/entities/server/ui/role-badge";
import { cn } from "@/shared/lib/cn";
import { getInitials } from "@/shared/lib/get-initials";
import { Card } from "@/shared/ui/core/card";
import { AppAvatar } from "@/shared/ui/kit/app-avatar";

type Props = ComponentProps<typeof Card> & {
  member: ServerMember;
  isOnline?: boolean;
};

export function MemberCard({ member, isOnline = false, className, ...props }: Props) {
  const initials = getInitials(member.username);
  const fallbackSubtitle = ROLE_DISPLAY_VARIANTS[member.role]?.label ?? "Member";

  return (
    <Card
      size="sm"
      className={cn(
        "group/member flex flex-row items-center gap-2.5 rounded-md px-2 py-1.5 transition-colors hover:bg-muted/50 select-none cursor-pointer border-none ring-0",
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
            isOnline ? "bg-success" : "bg-muted-foreground/40",
          )}
        />
      </div>

      <div className="flex flex-col min-w-0 flex-1">
        <div className="flex items-center gap-1.5">
          <span className="truncate text-xs font-medium text-foreground">{member.username}</span>
          <RoleBadge role={member.role} />
        </div>
        <span className="truncate text-2xs text-muted-foreground">
          {member.about ?? fallbackSubtitle}
        </span>
      </div>
    </Card>
  );
}
