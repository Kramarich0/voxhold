import type { ServerRole } from "./server.types";

export type RoleDisplayConfig = {
  label: string;
  badgeVariant: "default" | "secondary" | "outline";
  className?: string;
  priority: number;
};

export const ROLE_DISPLAY_VARIANTS: Record<ServerRole, RoleDisplayConfig | null> = {
  owner: {
    label: "Owner",
    badgeVariant: "default",
    className: "bg-warning/10 text-warning border border-warning/50",
    priority: 1,
  },
  admin: {
    label: "Admin",
    badgeVariant: "secondary",
    className: "bg-muted",
    priority: 2,
  },
  member: null,
};
