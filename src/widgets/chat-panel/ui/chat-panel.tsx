import { PushPinIcon, UserPlusIcon, UsersIcon } from "@phosphor-icons/react";
import { getRouteApi } from "@tanstack/react-router";
import { format, isSameDay } from "date-fns";
import { useEffect, useRef } from "react";
import type { UserRole } from "@/entities/auth/model/auth.types";
import type { Channel } from "@/entities/channel/model/channel.types";
import {
  useChannelMessagesQuery,
  useChannelPinsQuery,
} from "@/entities/message/api/message.queries";
import type { Message } from "@/entities/message/model/message.types";
import { MessageItem } from "@/entities/message/ui/message-item";
import { useServerMembersQuery } from "@/entities/server/api/server.queries";
import { RoleBadge } from "@/entities/server/ui/role-badge";
import { MessageInput } from "@/features/message/ui/message-input";
import { Badge } from "@/shared/ui/core/badge";
import { Button } from "@/shared/ui/core/button";
import { ScrollArea } from "@/shared/ui/core/scroll-area";
import { AppSearch } from "@/shared/ui/kit/app-search";
import { AppTooltip } from "@/shared/ui/kit/app-tooltip";
import { ThemeToggle } from "@/shared/ui/kit/theme-toggle";
import { ChatHeader } from "./chat-header";

type Props = {
  serverId: number;
  channel: Channel;
  isMembersOpen: boolean;
  onToggleMembers: () => void;
};

const routeApi = getRouteApi("/_app/channels/$serverId/$channelId");

export function ChatPanel({ serverId, channel, isMembersOpen, onToggleMembers }: Props) {
  const navigate = routeApi.useNavigate();
  const searchParams = routeApi.useSearch();
  const currentSearch = searchParams.search ?? "";

  const { data, isLoading } = useChannelMessagesQuery(serverId, channel.id);
  const { data: pins = [] } = useChannelPinsQuery(serverId, channel.id);
  const { data: members = [] } = useServerMembersQuery(serverId);
  const scrollBottomRef = useRef<HTMLDivElement>(null);

  const pinnedMessageIds = new Set(pins.map((p) => p.message.id));
  const memberRoleMap = new Map(members.map((m) => [m.user_id, m.role]));
  const allMessages = data?.pages.flatMap((page) => page.messages) ?? [];

  const displayedMessages = currentSearch
    ? allMessages.filter(
        (m) =>
          m.content.toLowerCase().includes(currentSearch.toLowerCase()) ||
          m.author.username.toLowerCase().includes(currentSearch.toLowerCase()),
      )
    : allMessages;

  useEffect(() => {
    if (!isLoading && displayedMessages.length > 0 && currentSearch == null) {
      scrollBottomRef.current?.scrollIntoView({ behavior: "instant" });
    }
  }, [isLoading, displayedMessages.length, currentSearch]);

  const handleSearch = (query: string) => {
    navigate({
      search: (prev: Record<string, unknown>) => ({
        ...prev,
        search: query || undefined,
      }),
      replace: true,
    });
  };

  return (
    <main className="flex h-full flex-1 min-w-0 min-h-0 flex-col overflow-hidden bg-background">
      <ChatHeader>
        <ChatHeader.Info channel={channel} topic="Everything important is here" />

        <ChatHeader.Actions>
          <AppTooltip content="Invite Members" side="bottom">
            <Button variant="ghost" size="icon-lg" className="text-muted-foreground">
              <UserPlusIcon />
            </Button>
          </AppTooltip>

          <AppTooltip content="Pinned Messages" side="bottom">
            <Button variant="ghost" size="icon-lg" className="text-muted-foreground relative">
              <PushPinIcon />
              {pins.length > 0 && (
                <Badge
                  variant="default"
                  className="absolute -top-1 -right-1 h-3.5 min-w-3.5 px-1 text-3xs bg-warning text-warning-foreground font-bold"
                >
                  {pins.length}
                </Badge>
              )}
            </Button>
          </AppTooltip>

          <AppSearch
            value={currentSearch}
            onSearch={handleSearch}
            placeholder={`Search in #${channel.name}...`}
            className="w-56"
          />

          <ThemeToggle />

          <AppTooltip content="Toggle Member List" side="bottom">
            <Button
              variant={isMembersOpen ? "secondary" : "ghost"}
              size="lg"
              className="gap-1.5 ml-1 text-xs"
              onClick={onToggleMembers}
            >
              <UsersIcon />
              {members.length > 0 && (
                <span className="tabular-nums font-medium">{members.length}</span>
              )}
            </Button>
          </AppTooltip>
        </ChatHeader.Actions>
      </ChatHeader>

      <ScrollArea className="flex-1 min-h-0 w-full">
        {isLoading ? (
          <div className="flex h-full items-center justify-center p-8 text-xs text-muted-foreground animate-pulse">
            Loading messages...
          </div>
        ) : displayedMessages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full p-8 text-center select-none">
            {currentSearch == null ? (
              <>
                <h3 className="text-sm font-semibold text-foreground">No messages found</h3>
                <p className="text-xs text-muted-foreground mt-1 max-w-sm">
                  No results matching "{currentSearch}"
                </p>
              </>
            ) : (
              <>
                <h3 className="text-sm font-bold text-foreground">Welcome to #{channel.name}!</h3>
                <p className="text-xs text-muted-foreground mt-1 max-w-sm">
                  This is the start of the #{channel.name} channel.
                </p>
              </>
            )}
          </div>
        ) : (
          <div className="flex flex-col py-4">
            {displayedMessages.map((message, index) => (
              <MessageRow
                key={message.id}
                message={message}
                prevMessage={displayedMessages[index - 1]}
                isPinned={pinnedMessageIds.has(message.id)}
                role={memberRoleMap.get(message.author.user_id)}
              />
            ))}
            <div ref={scrollBottomRef} />
          </div>
        )}
      </ScrollArea>

      <MessageInput serverId={serverId} channelId={channel.id} channelName={channel.name} />
    </main>
  );
}

function MessageRow({
  message,
  prevMessage,
  isPinned,
  role,
}: {
  message: Message;
  prevMessage?: Message;
  isPinned: boolean;
  role?: UserRole;
}) {
  const messageDate = new Date(message.created_at * 1000);
  const showDateSeparator =
    prevMessage == null || !isSameDay(messageDate, new Date(prevMessage.created_at * 1000));

  return (
    <div>
      {showDateSeparator && (
        <div className="relative my-4 flex items-center justify-center px-4 select-none">
          <div className="absolute inset-x-4 h-px bg-border/40" />
          <span className="relative rounded-full bg-muted/60 px-2.5 py-0.5 text-2xs font-bold tracking-wider text-muted-foreground uppercase">
            {format(messageDate, "MMMM d, yyyy")}
          </span>
        </div>
      )}
      <MessageItem message={message} isPinned={isPinned} badge={<RoleBadge role={role} />} />
    </div>
  );
}
