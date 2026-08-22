import { useQueryClient } from "@tanstack/react-query";
import { useEffect } from "react";
import { messageCache } from "../model/message.cache";
import { messageWs } from "./message.ws";

export function useMessageSubscriptions(serverId: number, channelId?: number) {
  const queryClient = useQueryClient();

  useEffect(() => {
    if (!serverId || !channelId) return;

    const unsubCreated = messageWs.onCreated((msg) => {
      if (msg.channel_id === channelId) {
        messageCache.append(queryClient, serverId, channelId, msg);
      }
    });

    const unsubUpdated = messageWs.onUpdated((msg) => {
      if (msg.channel_id === channelId) {
        messageCache.update(queryClient, serverId, channelId, msg);
      }
    });

    const unsubDeleted = messageWs.onDeleted((ref) => {
      if (ref.channel_id === channelId) {
        messageCache.delete(queryClient, serverId, channelId, ref.message_id);
      }
    });

    const unsubPinned = messageWs.onPinned((pinnedItem) => {
      if (pinnedItem.message.channel_id === channelId) {
        messageCache.pin(queryClient, serverId, channelId, pinnedItem);
      }
    });

    const unsubUnpinned = messageWs.onUnpinned((ref) => {
      if (ref.channel_id === channelId) {
        messageCache.unpin(queryClient, serverId, channelId, ref.message_id);
      }
    });

    return () => {
      unsubCreated();
      unsubUpdated();
      unsubDeleted();
      unsubPinned();
      unsubUnpinned();
    };
  }, [queryClient, serverId, channelId]);
}
