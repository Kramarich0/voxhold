import {
  infiniteQueryOptions,
  queryOptions,
  useInfiniteQuery,
  useQuery,
} from "@tanstack/react-query";
import { messageKeys } from "../model/message.keys";
import { messageHttp } from "./message.http";

export const channelMessagesQueryOptions = (serverId: number, channelId: number) =>
  infiniteQueryOptions({
    queryKey: messageKeys.channel(serverId, channelId),
    queryFn: ({ pageParam }) => messageHttp.getMessages(serverId, channelId, pageParam),
    initialPageParam: undefined as number | undefined,
    getNextPageParam: (lastPage) => lastPage.pagination.next_before_id ?? undefined,
  });

export const channelPinsQueryOptions = (serverId: number, channelId: number) =>
  queryOptions({
    queryKey: messageKeys.pins(serverId, channelId),
    queryFn: () => messageHttp.getPinnedMessages(serverId, channelId),
  });

export const serverMessageSearchQueryOptions = (serverId: number, query: string, limit = 25) =>
  infiniteQueryOptions({
    queryKey: messageKeys.search(serverId, query),
    queryFn: ({ pageParam }) => messageHttp.searchMessages(serverId, query, pageParam, limit),
    initialPageParam: undefined as number | undefined,
    getNextPageParam: (lastPage) => lastPage.pagination.next_before_id ?? undefined,
  });

export const messageContextQueryOptions = (
  serverId: number,
  channelId: number,
  messageId: number,
  before = 25,
  after = 25,
) =>
  queryOptions({
    queryKey: messageKeys.context(serverId, channelId, messageId),
    queryFn: () => messageHttp.getMessageContext(serverId, channelId, messageId, before, after),
  });

export function useChannelMessagesQuery(serverId?: number | null, channelId?: number | null) {
  const isEnabled = serverId != null && serverId > 0 && channelId != null && channelId > 0;

  return useInfiniteQuery({
    ...channelMessagesQueryOptions(serverId ?? 0, channelId ?? 0),
    enabled: isEnabled,
  });
}

export function useChannelPinsQuery(serverId?: number | null, channelId?: number | null) {
  const isEnabled = serverId != null && serverId > 0 && channelId != null && channelId > 0;

  return useQuery({
    ...channelPinsQueryOptions(serverId ?? 0, channelId ?? 0),
    enabled: isEnabled,
  });
}

export function useServerMessageSearchQuery(serverId?: number | null, query?: string, limit = 25) {
  const trimmedQuery = query?.trim() ?? "";
  const isEnabled = serverId != null && serverId > 0 && trimmedQuery.length > 0;

  return useInfiniteQuery({
    ...serverMessageSearchQueryOptions(serverId ?? 0, trimmedQuery, limit),
    enabled: isEnabled,
  });
}

export function useMessageContextQuery(
  serverId?: number | null,
  channelId?: number | null,
  messageId?: number | null,
  before = 25,
  after = 25,
) {
  const isEnabled =
    serverId != null &&
    serverId > 0 &&
    channelId != null &&
    channelId > 0 &&
    messageId != null &&
    messageId > 0;

  return useQuery({
    ...messageContextQueryOptions(serverId ?? 0, channelId ?? 0, messageId ?? 0, before, after),
    enabled: isEnabled,
  });
}
