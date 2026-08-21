import { cn } from "@/shared/lib/cn";
import { Badge } from "@/shared/ui/core/badge";
import { ROLE_DISPLAY_VARIANTS } from "../model/server.constants";
import type { ServerRole } from "../model/server.types";

type RoleBadgeProps = {
  role?: ServerRole;
  className?: string;
};

export function RoleBadge({ role, className }: RoleBadgeProps) {
  if (role == null) return null;

  const config = ROLE_DISPLAY_VARIANTS[role];
  if (config == null) return null;

  return (
    <Badge
      variant={config.badgeVariant}
      className={cn("text-3xs px-1 py-0 h-3 uppercase tracking-wide", config.className, className)}
    >
      {config.label}
    </Badge>
  );
}
