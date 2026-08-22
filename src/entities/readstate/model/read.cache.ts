import type { QueryClient } from "@tanstack/react-query";
import type { WsChannelReadData } from "@/shared/api/ws-client";
import { readKeys } from "./read.keys";

export const readCache = {
  setSnapshot: (queryClient: QueryClient, reads: WsChannelReadData[]) => {
    queryClient.setQueryData<Record<number, number>>(readKeys.myReads(), (old = {}) => {
      const next = { ...old };
      for (const r of reads) {
        next[r.channel_id] = r.last_read_message_id;
      }
      return next;
    });
  },

  updateRead: (queryClient: QueryClient, read: WsChannelReadData, currentUserId?: number) => {
    if (currentUserId == null || read.user_id === currentUserId) {
      queryClient.setQueryData<Record<number, number>>(readKeys.myReads(), (old = {}) => {
        const current = old[read.channel_id] ?? 0;
        if (read.last_read_message_id > current) {
          return { ...old, [read.channel_id]: read.last_read_message_id };
        }
        return old;
      });
    }
  },

  setLatestMessageId: (queryClient: QueryClient, channelId: number, messageId: number) => {
    queryClient.setQueryData<number>(readKeys.channelLatestMessage(channelId), (old = 0) => {
      return Math.max(old, messageId);
    });
  },
};
