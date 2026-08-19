import {
  infiniteQueryOptions,
  queryOptions,
  useInfiniteQuery,
  useQuery,
} from "@tanstack/react-query";
import { messageKeys } from "../model/message.keys";
import { messageApi } from "./message.api";

export const channelMessagesQueryOptions = (serverId: number, channelId: number) =>
  infiniteQueryOptions({
    queryKey: messageKeys.channel(serverId, channelId),
    queryFn: ({ pageParam }) =>
      messageApi.getMessages(serverId, channelId, pageParam as number | undefined),
    initialPageParam: undefined as number | undefined,
    getNextPageParam: (lastPage) => lastPage.pagination.next_before_id ?? undefined,
  });

export const channelPinsQueryOptions = (serverId: number, channelId: number) =>
  queryOptions({
    queryKey: messageKeys.pins(serverId, channelId),
    queryFn: () => messageApi.getPinnedMessages(serverId, channelId),
  });

export function useChannelMessagesQuery(
  serverId: number | null | undefined,
  channelId: number | null | undefined,
) {
  const isEnabled = serverId != null && serverId > 0 && channelId != null && channelId > 0;

  return useInfiniteQuery({
    ...channelMessagesQueryOptions(serverId ?? 0, channelId ?? 0),
    enabled: isEnabled,
  });
}

export function useChannelPinsQuery(
  serverId: number | null | undefined,
  channelId: number | null | undefined,
) {
  const isEnabled = serverId != null && serverId > 0 && channelId != null && channelId > 0;

  return useQuery({
    ...channelPinsQueryOptions(serverId ?? 0, channelId ?? 0),
    enabled: isEnabled,
  });
}
