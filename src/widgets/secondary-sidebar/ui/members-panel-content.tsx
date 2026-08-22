import { UsersIcon } from "@phosphor-icons/react";
import { useMyServersQuery, useServerMembersQuery } from "@/entities/server/api/server.queries";
import { useServerPresence } from "@/entities/server/api/server.subscriptions";
import type { ServerMember } from "@/entities/server/model/server.types";
import { MemberCard, MemberCardSkeleton } from "@/entities/server/ui/member-card";
import { RoleBadge } from "@/entities/server/ui/role-badge";
import { useMeQuery } from "@/entities/user/api/user.queries";
import { UserProfilePopover } from "@/entities/user/ui/user-profile-popover";
import { MemberContextMenu } from "@/features/server/ui/member-context-menu";
import { ScrollArea } from "@/shared/ui/core/scroll-area";
import { EmptyState } from "@/shared/ui/kit/empty-state";
import { SkeletonList } from "@/shared/ui/kit/skeleton-list";

type Props = {
  serverId: number;
};

type MemberGroup = {
  title: string;
  members: ServerMember[];
  isOnline: boolean;
};

export function MembersPanelContent({ serverId }: Props) {
  const onlineUserIds = useServerPresence(serverId);
  const { data: members = [], isLoading } = useServerMembersQuery(serverId);
  const { data: myServers = [] } = useMyServersQuery();
  const { data: me } = useMeQuery();

  const currentServer = myServers.find((s) => s.id === serverId);
  const currentUserRole = currentServer?.role;

  const onlineMembers = members.filter(
    (member) => onlineUserIds?.has(member.user_id) ?? member.last_seen_at != null,
  );
  const offlineMembers = members.filter(
    (member) => !(onlineUserIds?.has(member.user_id) ?? member.last_seen_at != null),
  );

  const memberGroups = [
    { title: "Online", members: onlineMembers, isOnline: true },
    { title: "Offline", members: offlineMembers, isOnline: false },
  ] as const satisfies readonly MemberGroup[];

  const hasAnyMembers = members.length > 0;

  return (
    <ScrollArea className="flex-1 px-2 py-3">
      {isLoading ? (
        <SkeletonList
          count={8}
          component={MemberCardSkeleton}
          className="flex flex-col gap-1 p-1"
        />
      ) : !hasAnyMembers ? (
        <EmptyState
          icon={<UsersIcon className="size-5" />}
          title="No members found"
          description="There are no members in this server yet."
        />
      ) : (
        <div className="flex flex-col gap-4">
          {memberGroups.map(
            (group) =>
              group.members.length > 0 && (
                <section key={group.title} className="flex flex-col gap-1">
                  <span className="px-2 text-2xs font-bold tracking-wider text-muted-foreground uppercase select-none">
                    {group.title} — {group.members.length}
                  </span>
                  <div className="flex flex-col gap-0.5">
                    {group.members.map((member) => (
                      <MemberContextMenu
                        key={member.user_id}
                        serverId={serverId}
                        member={member}
                        currentUserId={me?.id}
                        currentUserRole={currentUserRole}
                      >
                        <UserProfilePopover
                          key={member.user_id}
                          userId={member.user_id}
                          roleBadge={<RoleBadge role={member.role} />}
                          isOnline={group.isOnline}
                          side="left"
                          className="w-full"
                        >
                          <MemberCard member={member} isOnline={group.isOnline} />
                        </UserProfilePopover>
                      </MemberContextMenu>
                    ))}
                  </div>
                </section>
              ),
          )}
        </div>
      )}
    </ScrollArea>
  );
}
