import { XIcon } from "@phosphor-icons/react";
import { useServerMembersQuery } from "@/entities/server/api/server.queries";
import type { ServerMember } from "@/entities/server/model/server.types";
import { MemberCard } from "@/entities/server/ui/member-card";
import { Button } from "@/shared/ui/core/button";
import { ScrollArea } from "@/shared/ui/core/scroll-area";

type Props = {
  serverId: number;
  onlineUserIds?: Set<number>;
  onClose?: () => void;
};

type MemberGroup = {
  title: string;
  members: ServerMember[];
  isOnline: boolean;
};

export function MembersSidebar({ serverId, onlineUserIds, onClose }: Props) {
  const { data: members = [], isLoading } = useServerMembersQuery(serverId);

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

  return (
    <aside className="flex h-full w-60 flex-col border-l border-border/50 bg-sidebar select-none">
      <header className="flex h-12 items-center justify-between border-b border-border/40 px-3 shrink-0">
        <span className="text-xs-tight font-bold tracking-wider text-muted-foreground uppercase">
          Members • {members.length}
        </span>
        {onClose != null && (
          <Button
            variant="ghost"
            size="icon-sm"
            onClick={onClose}
            className="text-muted-foreground hover:text-foreground"
          >
            <XIcon />
          </Button>
        )}
      </header>
      <ScrollArea className="flex-1 px-2 py-3">
        {isLoading ? (
          <div className="p-4 text-center text-xs text-muted-foreground animate-pulse">
            Loading members...
          </div>
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
                        <MemberCard
                          key={member.user_id}
                          member={member}
                          isOnline={group.isOnline}
                        />
                      ))}
                    </div>
                  </section>
                ),
            )}
          </div>
        )}
      </ScrollArea>
      );
    </aside>
  );
}
