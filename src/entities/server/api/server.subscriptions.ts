import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect } from "react";
import { serverCache } from "../model/server.cache";
import { serverKeys } from "../model/server.keys";
import { serverWs } from "./server.ws";

export function useServerSubscriptions(serverId?: number | null) {
  const queryClient = useQueryClient();

  useEffect(() => {
    if (serverId == null || serverId <= 0) return;

    const unsubJoined = serverWs.onMemberJoined((data) => {
      if (data.server_id === serverId) {
        serverCache.addMember(queryClient, serverId, data.member);
      }
    });

    const unsubRoleUpdated = serverWs.onMemberRoleUpdated((data) => {
      if (data.server_id === serverId) {
        serverCache.updateMember(queryClient, serverId, data.member);
      }
    });

    const unsubRemoved = serverWs.onMemberRemoved((data) => {
      if (data.server_id === serverId) {
        serverCache.removeMember(queryClient, serverId, data.user_id);
      }
    });

    const unsubPresenceSnapshot = serverWs.onPresenceSnapshot((data) => {
      serverCache.setPresenceSnapshot(queryClient, data.servers);
    });

    const unsubPresenceUpdated = serverWs.onPresenceUpdated((data) => {
      serverCache.updatePresence(queryClient, data.server_id, data.user_id, data.status);
    });

    return () => {
      unsubJoined();
      unsubRoleUpdated();
      unsubRemoved();
      unsubPresenceSnapshot();
      unsubPresenceUpdated();
    };
  }, [queryClient, serverId]);
}

export function useServerPresence(serverId?: number | null): Set<number> {
  const validId = serverId != null && serverId > 0 ? serverId : 0;

  const { data: onlineUserIds = new Set<number>() } = useQuery({
    queryKey: serverKeys.presence(validId),
    queryFn: () => new Set<number>(),
    staleTime: Number.POSITIVE_INFINITY,
    gcTime: Number.POSITIVE_INFINITY,
    enabled: validId > 0,
  });

  return onlineUserIds;
}
