import type { InfiniteData, QueryClient } from "@tanstack/react-query";
import type { WsMessagePinnedData } from "@/shared/api/ws-client";
import { messageKeys } from "./message.keys";
import type { Message, MessagePage, PinnedMessage } from "./message.types";

export const messageCache = {
  append: (queryClient: QueryClient, serverId: number, channelId: number, newMessage: Message) => {
    queryClient.setQueryData<InfiniteData<MessagePage>>(
      messageKeys.channel(serverId, channelId),
      (oldData) => {
        if (!oldData || oldData.pages.length === 0) return oldData;

        const alreadyExists = oldData.pages.some((page) =>
          page.messages.some((m) => m.id === newMessage.id),
        );
        if (alreadyExists) return oldData;

        return {
          ...oldData,
          pages: oldData.pages.map((page, index) =>
            index === 0 ? { ...page, messages: [...page.messages, newMessage] } : page,
          ),
        };
      },
    );
  },

  update: (
    queryClient: QueryClient,
    serverId: number,
    channelId: number,
    updatedMessage: Message,
  ) => {
    queryClient.setQueryData<InfiniteData<MessagePage>>(
      messageKeys.channel(serverId, channelId),
      (oldData) => {
        if (!oldData) return oldData;
        return {
          ...oldData,
          pages: oldData.pages.map((page) => ({
            ...page,
            messages: page.messages.map((m) => (m.id === updatedMessage.id ? updatedMessage : m)),
          })),
        };
      },
    );
  },

  delete: (queryClient: QueryClient, serverId: number, channelId: number, messageId: number) => {
    queryClient.setQueryData<InfiniteData<MessagePage>>(
      messageKeys.channel(serverId, channelId),
      (oldData) => {
        if (!oldData) return oldData;
        return {
          ...oldData,
          pages: oldData.pages.map((page) => ({
            ...page,
            messages: page.messages.filter((m) => m.id !== messageId),
          })),
        };
      },
    );
  },

  unpin: (queryClient: QueryClient, serverId: number, channelId: number, messageId: number) => {
    queryClient.setQueryData<PinnedMessage[]>(
      messageKeys.pins(serverId, channelId),
      (oldData = []) => oldData.filter((p) => p.message.id !== messageId),
    );
  },

  pin: (
    queryClient: QueryClient,
    serverId: number,
    channelId: number,
    pinnedData: WsMessagePinnedData,
  ) => {
    const channelCacheData = queryClient.getQueryData<InfiniteData<MessagePage>>(
      messageKeys.channel(serverId, channelId),
    );
    const foundMessage = channelCacheData?.pages
      .flatMap((p) => p.messages)
      .find((m) => m.id === pinnedData.message_id);

    if (foundMessage) {
      const newPinnedItem: PinnedMessage = {
        message: foundMessage,
        pinned_by: pinnedData.pinned_by,
        pinned_at: pinnedData.pinned_at,
      };

      queryClient.setQueryData<PinnedMessage[]>(
        messageKeys.pins(serverId, channelId),
        (oldPins = []) => {
          if (oldPins.some((p) => p.message.id === pinnedData.message_id)) return oldPins;
          return [newPinnedItem, ...oldPins];
        },
      );
    } else {
      queryClient.invalidateQueries({ queryKey: messageKeys.pins(serverId, channelId) });
    }
  },
};
