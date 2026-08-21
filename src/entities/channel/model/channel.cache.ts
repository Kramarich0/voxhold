import type { QueryClient } from "@tanstack/react-query";
import { channelKeys } from "./channel.keys";
import type { Channel } from "./channel.types";

export const channelCache = {
  add: (queryClient: QueryClient, serverId: number, newChannel: Channel) => {
    queryClient.setQueryData<Channel[]>(channelKeys.list(serverId), (oldData = []) => {
      if (oldData.some((c) => c.id === newChannel.id)) return oldData;
      return [...oldData, newChannel].sort((a, b) => a.position - b.position || a.id - b.id);
    });
  },

  update: (queryClient: QueryClient, serverId: number, updatedChannel: Channel) => {
    queryClient.setQueryData<Channel[]>(channelKeys.list(serverId), (oldData = []) => {
      if (!oldData) return oldData;
      return oldData.map((c) => (c.id === updatedChannel.id ? updatedChannel : c));
    });
  },

  remove: (queryClient: QueryClient, serverId: number, channelId: number) => {
    queryClient.setQueryData<Channel[]>(channelKeys.list(serverId), (oldData = []) => {
      if (!oldData) return oldData;
      return oldData.filter((c) => c.id !== channelId);
    });
  },
};
