import { useQueryClient } from "@tanstack/react-query";
import { useEffect } from "react";
import { channelCache } from "../model/channel.cache";
import { channelWs } from "./channel.ws";

export function useChannelRoomSubscription(serverId?: number | null, channelId?: number | null) {
  useEffect(() => {
    if (serverId == null || serverId <= 0 || channelId == null || channelId <= 0) {
      return;
    }

    channelWs.subscribe(serverId, channelId);

    return () => {
      channelWs.unsubscribe(serverId, channelId);
    };
  }, [serverId, channelId]);
}

export function useChannelListSubscriptions(serverId?: number | null) {
  const queryClient = useQueryClient();

  useEffect(() => {
    if (serverId == null || serverId <= 0) return;

    const unsubCreated = channelWs.onCreated((channel) => {
      if (channel.server_id === serverId) {
        channelCache.add(queryClient, serverId, channel);
      }
    });

    const unsubUpdated = channelWs.onUpdated((channel) => {
      if (channel.server_id === serverId) {
        channelCache.update(queryClient, serverId, channel);
      }
    });

    const unsubDeleted = channelWs.onDeleted((ref) => {
      if (ref.server_id === serverId) {
        channelCache.remove(queryClient, serverId, ref.channel_id);
      }
    });

    return () => {
      unsubCreated();
      unsubUpdated();
      unsubDeleted();
    };
  }, [queryClient, serverId]);
}
