import {
  type WsPresenceSnapshotData,
  type WsPresenceUpdatedData,
  type WsServerMemberChangedData,
  wsClient,
} from "@/shared/api/ws-client";

export const serverWs = {
  onMemberJoined: (callback: (data: WsServerMemberChangedData) => void) =>
    wsClient.on("server.member_joined", callback),

  onMemberRoleUpdated: (callback: (data: WsServerMemberChangedData) => void) =>
    wsClient.on("server.member_role_updated", callback),

  onMemberRemoved: (callback: (data: { server_id: number; user_id: number }) => void) =>
    wsClient.on("server.member_removed", callback),

  onPresenceSnapshot: (callback: (data: WsPresenceSnapshotData) => void) =>
    wsClient.on("presence.snapshot", callback),

  onPresenceUpdated: (callback: (data: WsPresenceUpdatedData) => void) =>
    wsClient.on("presence.updated", callback),
};
