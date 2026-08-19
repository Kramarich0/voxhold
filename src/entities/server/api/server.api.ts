import { api } from "@/shared/api/client";
import type {
  JoinedServer,
  Server,
  ServerMember,
  UpdateMemberRolePayload,
  UpdateServerPayload,
} from "../model/server.types";

export const serverApi = {
  getMyServers: () => api.get<JoinedServer[]>("/me/servers"),

  updateServer: (serverId: number, payload: UpdateServerPayload) =>
    api.patch<Server>(`/servers/${serverId}`, payload),

  getServerMembers: (serverId: number) => api.get<ServerMember[]>(`/servers/${serverId}/members`),

  updateMemberRole: (serverId: number, userId: number, payload: UpdateMemberRolePayload) =>
    api.patch<ServerMember>(`/servers/${serverId}/members/${userId}/role`, payload),

  banMember: (serverId: number, userId: number) =>
    api.post<void>(`/servers/${serverId}/bans/${userId}`),
};
