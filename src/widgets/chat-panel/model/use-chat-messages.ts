import { useEffect, useState } from "react";
import { messageHttp } from "@/entities/message/api/message.http";
import {
  useChannelMessagesQuery,
  useChannelPinsQuery,
  useMessageContextQuery,
} from "@/entities/message/api/message.queries";
import type { Message } from "@/entities/message/model/message.types";
import { useServerMembersQuery } from "@/entities/server/api/server.queries";

export function useChatMessages(
  serverId: number,
  channelId: number,
  targetMessageId?: number | null,
) {
  const {
    data: regularData,
    isLoading: isRegularLoading,
    fetchNextPage: fetchNextRegularPage,
    hasNextPage: hasNextRegularPage,
    isFetchingNextPage: isFetchingNextRegularPage,
  } = useChannelMessagesQuery(serverId, channelId);

  const { data: pins = [] } = useChannelPinsQuery(serverId, channelId);
  const { data: members = [] } = useServerMembersQuery(serverId);

  const regularMessages = regularData
    ? regularData.pages
        .slice()
        .reverse()
        .flatMap((page) => page.messages)
    : [];

  const isTargetInMemory =
    targetMessageId != null && regularMessages.some((m) => m.id === targetMessageId);

  const isContextMode = targetMessageId != null && !isTargetInMemory;

  const { data: contextData, isLoading: isContextLoading } = useMessageContextQuery(
    serverId,
    channelId,
    isContextMode ? targetMessageId : null,
    30,
    30,
  );

  const [extraContextOlderMessages, setExtraContextOlderMessages] = useState<Message[]>([]);
  const [extraContextNewerMessages, setExtraContextNewerMessages] = useState<Message[]>([]);

  const [isFetchingContextOlder, setIsFetchingContextOlder] = useState(false);
  const [isFetchingContextNewer, setIsFetchingContextNewer] = useState(false);
  const [hasMoreContextOlder, setHasMoreContextOlder] = useState(true);
  const [hasMoreContextNewer, setHasMoreContextNewer] = useState(true);

  useEffect(() => {
    setExtraContextOlderMessages([]);
    setExtraContextNewerMessages([]);
    setHasMoreContextOlder(true);
    setHasMoreContextNewer(true);
    setIsFetchingContextOlder(false);
    setIsFetchingContextNewer(false);
  }, [targetMessageId, channelId]);

  const baseContextMessages = contextData?.messages ?? [];
  const displayedMessages = isContextMode
    ? [...extraContextOlderMessages, ...baseContextMessages, ...extraContextNewerMessages]
    : regularMessages;

  const isMessagesLoading = isContextMode ? isContextLoading : isRegularLoading;
  const latestMessage = regularMessages[regularMessages.length - 1];

  const fetchOlderPage = async (): Promise<{ prependedCount: number }> => {
    if (isContextMode) {
      if (displayedMessages.length === 0 || !hasMoreContextOlder || isFetchingContextOlder) {
        return { prependedCount: 0 };
      }

      setIsFetchingContextOlder(true);
      try {
        const oldestMessageId = displayedMessages[0]?.id;
        const page = await messageHttp.getMessages(serverId, channelId, oldestMessageId, 30);

        setHasMoreContextOlder(page.pagination.has_more);
        if (page.messages.length > 0) {
          setExtraContextOlderMessages((prev) => [...page.messages, ...prev]);
          return { prependedCount: page.messages.length };
        }
      } catch (err) {
        console.error("Failed to fetch older context messages:", err);
      } finally {
        setIsFetchingContextOlder(false);
      }

      return { prependedCount: 0 };
    }

    const result = await fetchNextRegularPage();
    const pages = result.data?.pages;
    if (pages && pages.length > 1) {
      const newlyPrependedCount = pages[pages.length - 1]?.messages?.length ?? 0;
      return { prependedCount: newlyPrependedCount };
    }

    return { prependedCount: 0 };
  };

  const fetchNewerPage = async () => {
    if (
      !isContextMode ||
      isFetchingContextNewer ||
      !hasMoreContextNewer ||
      displayedMessages.length === 0
    ) {
      return;
    }

    const newestMessage = displayedMessages[displayedMessages.length - 1];
    if (newestMessage == null) return;

    if (latestMessage && newestMessage.id >= latestMessage.id) {
      setHasMoreContextNewer(false);
      return;
    }

    setIsFetchingContextNewer(true);
    try {
      const response = await messageHttp.getMessageContext(
        serverId,
        channelId,
        newestMessage.id,
        1,
        50,
      );
      const newerMessages = response.messages.filter((m) => m.id > newestMessage.id);

      if (newerMessages.length === 0) {
        setHasMoreContextNewer(false);
      } else {
        setExtraContextNewerMessages((prev) => [...prev, ...newerMessages]);
      }
    } catch (err) {
      console.error("Failed to fetch newer context messages:", err);
    } finally {
      setIsFetchingContextNewer(false);
    }
  };

  const hasNextPage = isContextMode ? hasMoreContextOlder : Boolean(hasNextRegularPage);
  const isFetchingNextPage = isContextMode ? isFetchingContextOlder : isFetchingNextRegularPage;

  const pinnedMessageIds = new Set(pins.map((p) => p.message.id));
  const memberRoleMap = new Map(members.map((m) => [m.user_id, m.role]));

  return {
    displayedMessages,
    regularMessages,
    latestMessage,
    isMessagesLoading,
    isContextMode,
    hasNextPage,
    isFetchingNextPage,
    isFetchingNewerPage: isFetchingContextNewer,
    fetchOlderPage,
    fetchNewerPage,
    pinnedMessageIds,
    memberRoleMap,
    pinsCount: pins.length,
    membersCount: members.length,
  };
}
