import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect } from "react";
import type { Channel } from "@/entities/channel/model/channel.types";
import { messageWs } from "@/entities/message/api/message.ws";
import { useMeQuery } from "@/entities/user/api/user.queries";
import { readCache } from "../model/read.cache";
import { readKeys } from "../model/read.keys";
import { readWs } from "./read.ws";

export function useReadStateSubscriptions() {
  const queryClient = useQueryClient();
  const { data: me } = useMeQuery();

  useEffect(() => {
    const unsubSnapshot = readWs.onSnapshot((data) => {
      readCache.setSnapshot(queryClient, data.reads);
    });

    const unsubRead = readWs.onChannelRead((data) => {
      readCache.updateRead(queryClient, data, me?.id);
    });

    const unsubMsg = messageWs.onCreated((msg) => {
      readCache.setLatestMessageId(queryClient, msg.channel_id, msg.id);
    });

    return () => {
      unsubSnapshot();
      unsubRead();
      unsubMsg();
    };
  }, [queryClient, me?.id]);
}

export function useIsChannelUnread(channel: Channel): boolean {
  const { data: myReads = {} } = useQuery({
    queryKey: readKeys.myReads(),
    queryFn: () => ({}) as Record<number, number>,
    staleTime: Number.POSITIVE_INFINITY,
  });

  const { data: rtLatestId = 0 } = useQuery({
    queryKey: readKeys.channelLatestMessage(channel.id),
    queryFn: () => 0,
    staleTime: Number.POSITIVE_INFINITY,
  });

  const latestMessageId = Math.max(rtLatestId, channel.last_message_id ?? 0);
  const lastReadId = myReads[channel.id] ?? 0;

  if (latestMessageId === 0) return false;

  return latestMessageId > lastReadId;
}
