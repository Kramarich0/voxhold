import { http } from "@/shared/api/http-client";
import type { DirectInvite, IncomingInvite } from "@/shared/api/ws-client";
import type {
  CreateDirectInvitePayload,
  CreateInviteLinkPayload,
  InviteLink,
  LinkAcceptance,
  LinkPreview,
} from "../model/invite.types";

export const inviteHttp = {
  createLink: (serverId: number, payload: CreateInviteLinkPayload) =>
    http.post<InviteLink>(`/servers/${serverId}/invite-links`, payload),

  resolveLink: (token: string) =>
    http.post<LinkPreview>("/invite-links/resolve", { token }, { skipAuth: true }),

  acceptLink: (token: string) => http.post<LinkAcceptance>("/invite-links/accept", { token }),

  createDirectInvite: (serverId: number, payload: CreateDirectInvitePayload) =>
    http.post<DirectInvite>(`/servers/${serverId}/invites`, payload),

  getIncomingInvites: () => http.get<IncomingInvite[]>("/me/server-invites"),

  acceptInvite: (inviteId: number) => http.post<void>(`/me/server-invites/${inviteId}/accept`),

  declineInvite: (inviteId: number) => http.post<void>(`/me/server-invites/${inviteId}/decline`),
};
