import {
  ArrowDownIcon,
  HashIcon,
  MagnifyingGlassIcon,
  PushPinIcon,
  UsersIcon,
} from "@phosphor-icons/react";
import { getRouteApi } from "@tanstack/react-router";
import { memo, useEffect, useMemo, useState } from "react";
import { Virtuoso } from "react-virtuoso";
import { useChannelRoomSubscription } from "@/entities/channel/api/channel.subscriptions";
import type { Channel } from "@/entities/channel/model/channel.types";
import { useMessageSubscriptions } from "@/entities/message/api/message.subscriptions";
import type { Message } from "@/entities/message/model/message.types";
import { MessageItem, MessageItemSkeleton } from "@/entities/message/ui/message-item";
import { useServerPresence } from "@/entities/server/api/server.subscriptions";
import type { ServerRole } from "@/entities/server/model/server.types";
import { RoleBadge } from "@/entities/server/ui/role-badge";
import { UserProfilePopover } from "@/entities/user/ui/user-profile-popover";
import {
  useDeleteMessageMutation,
  usePinMessageMutation,
} from "@/features/message/api/message.mutations";
import { useChannelReadTracker } from "@/features/message/model/use-channel-read-tracker";
import { EditMessageForm } from "@/features/message/ui/edit-message-form";
import { MessageActions } from "@/features/message/ui/message-actions";
import { MessageInput } from "@/features/message/ui/message-input";
import { cn } from "@/shared/lib/cn";
import { formatDateDivider, isSameDayTimestamp } from "@/shared/lib/date";
import { getInitials } from "@/shared/lib/get-initials";
import { Badge } from "@/shared/ui/core/badge";
import { Button } from "@/shared/ui/core/button";
import { Spinner } from "@/shared/ui/core/spinner";
import { AppAvatar } from "@/shared/ui/kit/app-avatar";
import { AppTooltip } from "@/shared/ui/kit/app-tooltip";
import { EmptyState } from "@/shared/ui/kit/empty-state";
import { SkeletonList } from "@/shared/ui/kit/skeleton-list";
import { ThemeToggle } from "@/shared/ui/kit/theme-toggle";
import { useChatMessages } from "../model/use-chat-messages";
import { useChatScroll } from "../model/use-chat-scroll";
import { ChatHeader } from "./chat-header";

export type RightPanelMode = "members" | "search" | "pins" | null;

type Props = {
  serverId: number;
  channel: Channel;
  activePanel: RightPanelMode;
  targetMessageId?: number | null;
  onTogglePanel: (panel: NonNullable<RightPanelMode>) => void;
};

type VirtuosoContext = {
  isFetchingNextPage: boolean;
  isFetchingNewerPage: boolean;
  hasNextPage: boolean;
  isContextMode: boolean;
  channelName: string;
};

const BOTTOM_SCROLL_THRESHOLD_PX = 64;
const routeApi = getRouteApi("/_app/channels/$serverId/$channelId");

const VIRTUOSO_COMPONENTS = {
  Header: ({ context }: { context?: VirtuosoContext }) => {
    if (!context) return null;
    return (
      <div className="pt-2">
        {context.isFetchingNextPage && (
          <div className="flex items-center justify-center py-3 shrink-0">
            <Spinner className="text-muted-foreground" />
          </div>
        )}

        {!context.hasNextPage && !context.isContextMode && (
          <div className="flex flex-col items-start px-6 py-6 select-none border-b border-border/40 pb-4 justify-end">
            <div className="size-10 rounded-full bg-primary/10 flex items-center justify-center mb-2">
              <HashIcon className="size-5 text-primary" />
            </div>
            <h3 className="text-base font-bold text-foreground">
              Welcome to #{context.channelName}!
            </h3>
            <p className="text-xs text-muted-foreground mt-0.5">
              This is the very beginning of the #{context.channelName} channel history.
            </p>
          </div>
        )}
      </div>
    );
  },
  Footer: ({ context }: { context?: VirtuosoContext }) => {
    return (
      <div className="py-2 flex items-center justify-center min-h-4">
        {context?.isFetchingNewerPage && <Spinner className="size-4 text-muted-foreground" />}
      </div>
    );
  },
};

export function ChatPanel({
  serverId,
  channel,
  activePanel,
  targetMessageId,
  onTogglePanel,
}: Props) {
  useChannelRoomSubscription(serverId, channel.id);
  useMessageSubscriptions(serverId, channel.id);
  const navigate = routeApi.useNavigate();
  const [editingMessageId, setEditingMessageId] = useState<number | null>(null);
  const [highlightedMessageId, setHighlightedMessageId] = useState<number | null>(null);

  useEffect(() => {
    if (targetMessageId == null) return;
    setHighlightedMessageId(targetMessageId);
    const timer = setTimeout(() => setHighlightedMessageId(null), 2500);
    return () => clearTimeout(timer);
  }, [targetMessageId]);

  const {
    displayedMessages,
    regularMessages,
    latestMessage,
    isMessagesLoading,
    isContextMode,
    hasNextPage,
    isFetchingNextPage,
    isFetchingNewerPage,
    fetchOlderPage,
    fetchNewerPage,
    pinnedMessageIds,
    memberRoleMap,
    pinsCount,
    membersCount,
  } = useChatMessages(serverId, channel.id, targetMessageId);

  const {
    virtuosoRef,
    isAtBottom,
    setIsAtBottom,
    firstItemIndex,
    handleStartReached,
    handleEndReached,
    scrollToBottom,
  } = useChatScroll({
    displayedMessages,
    targetMessageId,
    isMessagesLoading,
    isContextMode,
    hasNextPage,
    isFetchingNextPage,
    fetchOlderPage,
    fetchNewerPage,
  });

  const deleteMessageMutation = useDeleteMessageMutation(serverId, channel.id);
  const pinMessageMutation = usePinMessageMutation(serverId, channel.id);

  useChannelReadTracker({
    serverId,
    channelId: channel.id,
    lastMessageId: latestMessage?.id,
    isAtBottom,
    enabled: !isContextMode && !isMessagesLoading && regularMessages.length > 0,
  });

  const handleJumpToLatest = () => {
    if (isContextMode) {
      navigate({ search: (prev) => ({ ...prev, targetMessageId: undefined }) });
    } else {
      scrollToBottom();
    }
  };

  const initialTopMostItemIndex = useMemo(() => {
    if (displayedMessages.length === 0) return 0;

    if (targetMessageId != null) {
      const targetIdx = displayedMessages.findIndex((m) => m.id === targetMessageId);
      if (targetIdx !== -1) {
        return {
          index: targetIdx,
          align: "center" as const,
        };
      }
    }

    return Math.max(0, displayedMessages.length - 1);
  }, [displayedMessages, targetMessageId]);

  const virtuosoContext: VirtuosoContext = {
    isFetchingNextPage,
    isFetchingNewerPage,
    hasNextPage,
    isContextMode,
    channelName: channel.name,
  };

  return (
    <main className="relative flex h-full flex-1 min-w-0 min-h-0 flex-col overflow-hidden bg-background">
      <ChatHeader>
        <ChatHeader.Info channel={channel} topic="Everything important is here" />

        <ChatHeader.Actions>
          <ThemeToggle />

          <AppTooltip content="Search Messages" side="bottom">
            <Button
              variant={activePanel === "search" ? "secondary" : "ghost"}
              size="icon-lg"
              className={cn("text-muted-foreground", activePanel === "search" && "text-foreground")}
              onClick={() => onTogglePanel("search")}
              aria-label="Toggle Search Panel"
            >
              <MagnifyingGlassIcon />
            </Button>
          </AppTooltip>

          <AppTooltip content="Pinned Messages" side="bottom">
            <Button
              variant={activePanel === "pins" ? "secondary" : "ghost"}
              size="icon-lg"
              className={cn(
                "text-muted-foreground relative",
                activePanel === "pins" && "text-foreground",
              )}
              onClick={() => onTogglePanel("pins")}
              aria-label="Toggle Pinned Messages"
            >
              <PushPinIcon />
              {pinsCount > 0 && (
                <Badge
                  variant="default"
                  className="absolute -top-1 -right-1 h-3.5 min-w-3.5 px-1 text-3xs bg-warning text-warning-foreground font-bold"
                >
                  {pinsCount}
                </Badge>
              )}
            </Button>
          </AppTooltip>

          <AppTooltip content="Toggle Member List" side="bottom">
            <Button
              variant={activePanel === "members" ? "secondary" : "ghost"}
              size="lg"
              className={cn(
                "gap-1.5 ml-1 text-xs text-muted-foreground",
                activePanel === "members" && "text-foreground",
              )}
              onClick={() => onTogglePanel("members")}
              aria-label="Toggle Member List"
            >
              <UsersIcon />
              {membersCount > 0 && <span className="tabular-nums font-medium">{membersCount}</span>}
            </Button>
          </AppTooltip>
        </ChatHeader.Actions>
      </ChatHeader>

      <div className="flex-1 min-h-0 w-full overflow-hidden flex flex-col">
        {isMessagesLoading ? (
          <SkeletonList
            count={9}
            component={({ index = 0 }) => <MessageItemSkeleton isCompact={index % 3 !== 0} />}
            className="flex flex-col gap-1 p-2"
          />
        ) : displayedMessages.length === 0 ? (
          <EmptyState
            icon={<HashIcon className="size-5 text-primary" />}
            title={`Welcome to #${channel.name}!`}
            description={`This is the start of the #${channel.name} channel history.`}
            className="h-full min-h-0"
          />
        ) : (
          <Virtuoso
            key={isContextMode ? `ctx-${targetMessageId}` : `live-${channel.id}`}
            ref={virtuosoRef}
            className="h-full w-full custom-scrollbar"
            data={displayedMessages}
            computeItemKey={(_, message) => message.id}
            context={virtuosoContext}
            firstItemIndex={firstItemIndex}
            initialTopMostItemIndex={initialTopMostItemIndex}
            alignToBottom={!isContextMode && targetMessageId == null}
            defaultItemHeight={48}
            skipAnimationFrameInResizeObserver={true}
            minOverscanItemCount={{ top: 8, bottom: 8 }}
            startReached={handleStartReached}
            endReached={handleEndReached}
            atBottomThreshold={BOTTOM_SCROLL_THRESHOLD_PX}
            atBottomStateChange={setIsAtBottom}
            followOutput={!isContextMode && targetMessageId == null ? "auto" : false}
            components={VIRTUOSO_COMPONENTS}
            itemContent={(virtuosoIndex, message) => {
              const localIndex = virtuosoIndex - firstItemIndex;
              const prevMessage = displayedMessages[localIndex - 1];

              return (
                <MessageRow
                  key={message.id}
                  message={message}
                  serverId={serverId}
                  prevMessage={prevMessage}
                  isPinned={pinnedMessageIds.has(message.id)}
                  isEditing={editingMessageId === message.id}
                  isHighlighted={highlightedMessageId === message.id}
                  role={memberRoleMap.get(message.author.user_id)}
                  onStartEdit={(id) => setEditingMessageId(id)}
                  onCancelEdit={() => setEditingMessageId(null)}
                  onPin={(msgId, pin) => pinMessageMutation.mutate({ messageId: msgId, pin })}
                  onDelete={(msgId) => deleteMessageMutation.mutate(msgId)}
                  isPinPending={pinMessageMutation.isPending}
                  isDeletePending={deleteMessageMutation.isPending}
                />
              );
            }}
          />
        )}
      </div>

      {(isContextMode || !isAtBottom) && (
        <div className="absolute bottom-16 right-6 z-20 animate-in fade-in-0 slide-in-from-bottom-2">
          <Button
            variant="secondary"
            size="sm"
            onClick={handleJumpToLatest}
            className="text-xs font-medium"
          >
            <span>{isContextMode ? "Jump to latest" : "Jump to bottom"}</span>
            <ArrowDownIcon className="size-3.5" />
          </Button>
        </div>
      )}

      <MessageInput serverId={serverId} channelId={channel.id} channelName={channel.name} />
    </main>
  );
}

type MessageRowProps = {
  message: Message;
  prevMessage?: Message;
  isPinned: boolean;
  isEditing: boolean;
  isHighlighted?: boolean;
  serverId: number;
  role?: ServerRole;
  onStartEdit: (id: number) => void;
  onCancelEdit: () => void;
  onPin: (messageId: number, pin: boolean) => void;
  onDelete: (messageId: number) => void;
  isPinPending?: boolean;
  isDeletePending?: boolean;
};

const GROUP_TIME_THRESHOLD_SECONDS = 10 * 60; // 10 minutes

const MessageRow = memo(function MessageRow({
  message,
  prevMessage,
  isPinned,
  isEditing,
  isHighlighted = false,
  role,
  serverId,
  onStartEdit,
  onCancelEdit,
  onPin,
  onDelete,
  isPinPending,
  isDeletePending,
}: MessageRowProps) {
  const showDateSeparator =
    prevMessage == null || !isSameDayTimestamp(message.created_at, prevMessage.created_at);
  const onlineUserIds = useServerPresence(serverId);
  const isAuthorOnline = onlineUserIds.has(message.author.user_id);
  const initials = getInitials(message.author.username);
  const isSameAuthor = prevMessage?.author.user_id === message.author.user_id;
  const isWithinTimeThreshold =
    prevMessage != null
      ? message.created_at - prevMessage.created_at < GROUP_TIME_THRESHOLD_SECONDS
      : false;

  const isCompact = !showDateSeparator && isSameAuthor && isWithinTimeThreshold;

  return (
    <div className="px-2">
      {showDateSeparator && (
        <div className="relative py-3 flex items-center justify-center px-4 select-none">
          <div className="absolute inset-x-4 h-px bg-border" />
          <span className="relative rounded-full bg-muted/50 px-2.5 py-0.5 text-2xs font-bold tracking-wider text-muted-foreground uppercase">
            {formatDateDivider(message.created_at)}
          </span>
        </div>
      )}

      <div className="w-full">
        <MessageItem
          message={message}
          isPinned={isPinned}
          isEditing={isEditing}
          isCompact={isCompact}
          className={cn("transition-colors rounded-md", isHighlighted && "bg-primary/15")}
          badge={<RoleBadge role={role} />}
          avatar={
            <UserProfilePopover
              userId={message.author.user_id}
              roleBadge={<RoleBadge role={role} />}
              isOnline={isAuthorOnline}
            >
              <AppAvatar name={initials} />
            </UserProfilePopover>
          }
          author={
            <UserProfilePopover
              userId={message.author.user_id}
              roleBadge={<RoleBadge role={role} />}
              isOnline={isAuthorOnline}
            >
              <span className="text-xs font-semibold text-foreground tracking-tight hover:underline cursor-pointer">
                {message.author.username}
              </span>
            </UserProfilePopover>
          }
          actions={
            !isEditing && (
              <MessageActions
                messageContent={message.content}
                messageId={message.id}
                isPinned={isPinned}
                onStartEdit={() => onStartEdit(message.id)}
                onPin={onPin}
                onDelete={onDelete}
                isPinPending={isPinPending}
                isDeletePending={isDeletePending}
              />
            )
          }
        >
          <EditMessageForm
            serverId={serverId}
            channelId={message.channel_id}
            message={message}
            onCancel={onCancelEdit}
          />
        </MessageItem>
      </div>
    </div>
  );
});
