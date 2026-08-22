import { ShieldCheckIcon, ShieldSlashIcon, UserMinusIcon } from "@phosphor-icons/react";
import { type ReactNode, useState } from "react";
import type { ServerMember, ServerRole } from "@/entities/server/model/server.types";
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuSeparator,
  ContextMenuTrigger,
} from "@/shared/ui/core/context-menu";
import { useUpdateMemberRoleMutation } from "../api/server.mutations";
import { BanMemberDialog } from "./ban-member-dialog";

type Props = {
  serverId: number;
  member: ServerMember;
  currentUserId?: number;
  currentUserRole?: ServerRole;
  children: ReactNode;
};

export function MemberContextMenu({
  serverId,
  member,
  currentUserId,
  currentUserRole,
  children,
}: Props) {
  const [banDialogOpen, setBanDialogOpen] = useState(false);
  const updateRole = useUpdateMemberRoleMutation(serverId);

  const isSelf = currentUserId === member.user_id;
  const isTargetOwner = member.role === "owner";
  const isOwner = currentUserRole === "owner";
  const isAdmin = currentUserRole === "admin";

  const canManageRoles = isOwner && !isSelf && !isTargetOwner;

  const canBan = !isSelf && !isTargetOwner && (isOwner || (isAdmin && member.role === "member"));

  if (!canManageRoles && !canBan) {
    return <>{children}</>;
  }

  const handlePromoteAdmin = () => {
    updateRole.mutate({ userId: member.user_id, payload: { role: "admin" } });
  };

  const handleDemoteMember = () => {
    updateRole.mutate({ userId: member.user_id, payload: { role: "member" } });
  };

  return (
    <>
      <ContextMenu>
        <ContextMenuTrigger render={<div className="w-full" />}>{children}</ContextMenuTrigger>

        <ContextMenuContent className="w-48">
          {canManageRoles && (
            <>
              {member.role === "member" ? (
                <ContextMenuItem onClick={handlePromoteAdmin} disabled={updateRole.isPending}>
                  <ShieldCheckIcon className="text-primary" />
                  <span>Make Admin</span>
                </ContextMenuItem>
              ) : (
                <ContextMenuItem onClick={handleDemoteMember} disabled={updateRole.isPending}>
                  <ShieldSlashIcon className="text-muted-foreground" />
                  <span>Remove Admin</span>
                </ContextMenuItem>
              )}
            </>
          )}

          {canManageRoles && canBan && <ContextMenuSeparator />}

          {canBan && (
            <ContextMenuItem variant="destructive" onClick={() => setBanDialogOpen(true)}>
              <UserMinusIcon />
              <span>Ban @{member.username}</span>
            </ContextMenuItem>
          )}
        </ContextMenuContent>
      </ContextMenu>

      <BanMemberDialog
        serverId={serverId}
        member={member}
        open={banDialogOpen}
        onOpenChange={setBanDialogOpen}
      />
    </>
  );
}
