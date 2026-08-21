import { http } from "@/shared/api/http-client";
import type {
  JoinedServer,
  Server,
  ServerMember,
  UpdateMemberRolePayload,
  UpdateServerPayload,
} from "../model/server.types";

export const serverHttp = {
  getMyServers: () => http.get<JoinedServer[]>("/me/servers"),

  updateServer: (serverId: number, payload: UpdateServerPayload) =>
    http.patch<Server>(`/servers/${serverId}`, payload),

  getServerMembers: (serverId: number) => http.get<ServerMember[]>(`/servers/${serverId}/members`),
  // TODO: implement this endpoint
  updateMemberRole: (serverId: number, userId: number, payload: UpdateMemberRolePayload) =>
    http.patch<ServerMember>(`/servers/${serverId}/members/${userId}/role`, payload),
  // TODO: implement this endpoint
  banMember: (serverId: number, userId: number) =>
    http.post<void>(`/servers/${serverId}/bans/${userId}`),
};
