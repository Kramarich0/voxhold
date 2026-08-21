import type { QueryClient } from "@tanstack/react-query";
import { serverKeys } from "./server.keys";
import type { JoinedServer, Server, ServerMember } from "./server.types";

export const serverCache = {
  updateServer: (queryClient: QueryClient, updatedServer: Server) => {
    queryClient.setQueryData<JoinedServer[]>(serverKeys.myServers(), (oldData = []) => {
      if (!oldData) return oldData;
      return oldData.map((s) =>
        s.id === updatedServer.id ? { ...s, name: updatedServer.name } : s,
      );
    });
  },

  addMember: (queryClient: QueryClient, serverId: number, member: ServerMember) => {
    queryClient.setQueryData<ServerMember[]>(serverKeys.members(serverId), (oldData = []) => {
      if (oldData.some((m) => m.user_id === member.user_id)) return oldData;
      return [...oldData, member];
    });
  },

  updateMember: (queryClient: QueryClient, serverId: number, member: ServerMember) => {
    queryClient.setQueryData<ServerMember[]>(serverKeys.members(serverId), (oldData = []) => {
      if (!oldData) return oldData;
      return oldData.map((m) => (m.user_id === member.user_id ? member : m));
    });
  },

  removeMember: (queryClient: QueryClient, serverId: number, userId: number) => {
    queryClient.setQueryData<ServerMember[]>(serverKeys.members(serverId), (oldData = []) => {
      if (!oldData) return oldData;
      return oldData.filter((m) => m.user_id !== userId);
    });
  },

  setPresenceSnapshot: (
    queryClient: QueryClient,
    servers: Array<{ server_id: number; online_user_ids: number[] }>,
  ) => {
    for (const server of servers) {
      queryClient.setQueryData(
        serverKeys.presence(server.server_id),
        new Set(server.online_user_ids),
      );
    }
  },

  updatePresence: (
    queryClient: QueryClient,
    serverId: number,
    userId: number,
    status: "online" | "offline",
  ) => {
    queryClient.setQueryData<Set<number>>(serverKeys.presence(serverId), (prev = new Set()) => {
      const next = new Set(prev);
      if (status === "online") {
        next.add(userId);
      } else {
        next.delete(userId);
      }
      return next;
    });
  },
};
