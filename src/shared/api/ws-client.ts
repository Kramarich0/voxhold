import { authToken } from "./auth-token";
import { createWsCore } from "./ws-core";

export type WsChannelRef = {
  server_id: number;
  channel_id: number;
};

export type WsMessageRef = {
  channel_id: number;
  message_id: number;
};

export type WsUserSummary = {
  user_id: number;
  username: string;
};

export type WsReadyData = {
  user_id: number;
  protocol_version: number;
};

export type WsErrorData = {
  code: string;
  message: string;
};

export type WsPresenceSnapshotData = {
  servers: Array<{
    server_id: number;
    online_user_ids: number[];
  }>;
};

export type WsPresenceUpdatedData = {
  server_id: number;
  user_id: number;
  status: "online" | "offline";
};

export type WsChannelData = {
  id: number;
  server_id: number;
  name: string;
  kind: "text" | "voice";
  position: number;
  created_by: number;
  created_at: number;
};

export type WsMessageData = {
  id: number;
  channel_id: number;
  author: WsUserSummary;
  content: string;
  created_at: number;
  edited_at: number | null;
};

export type WsMessagePinnedData = WsMessageRef & {
  pinned_by: WsUserSummary;
  pinned_at: number;
};

export type WsChannelReadData = {
  server_id: number;
  channel_id: number;
  user_id: number;
  last_read_message_id: number;
  updated_at: number;
};

export type WsChannelReadSnapshotData = WsChannelRef & {
  reads: WsChannelReadData[];
};

export type WsServerMemberData = WsUserSummary & {
  created_at: number;
  role: "owner" | "admin" | "member";
  joined_at: number;
  about: string;
  country_code: string | null;
  last_seen_at: number | null;
};

export type WsServerMemberChangedData = {
  server_id: number;
  member: WsServerMemberData;
};

export type IncomingEvents = {
  ready: WsReadyData;
  error: WsErrorData;
  "channel.subscribed": WsChannelRef;
  "channel.unsubscribed": WsChannelRef;
  "channel.created": WsChannelData;
  "channel.updated": WsChannelData;
  "channel.deleted": WsChannelRef;
  "channel.read": WsChannelReadData;
  "channel.read_snapshot": WsChannelReadSnapshotData;
  "read.snapshot": { reads: WsChannelReadData[] };
  "message.created": WsMessageData;
  "message.updated": WsMessageData;
  "message.deleted": WsMessageRef;
  "message.pinned": WsMessagePinnedData;
  "message.unpinned": WsMessageRef;
  "server.member_joined": WsServerMemberChangedData;
  "server.member_role_updated": WsServerMemberChangedData;
  "server.member_removed": { server_id: number; user_id: number };
  "server.deleted": { server_id: number };
  "presence.snapshot": WsPresenceSnapshotData;
  "presence.updated": WsPresenceUpdatedData;
};

export type OutgoingEvents = {
  auth: { token: string };
  "channel.subscribe": WsChannelRef;
  "channel.unsubscribe": WsChannelRef;
  "voice.join": { server_id: number; channel_id: number; self_mute: boolean; self_deaf: boolean };
  "voice.state_update": { self_mute: boolean; self_deaf: boolean };
  "voice.leave": Record<string, never>;
  "voice.webrtc_answer": { sdp: string };
  "voice.ice_candidate": {
    candidate: string;
    sdp_mid?: string;
    sdp_mline_index?: number;
    username_fragment?: string;
  };
};

export function createWsClient(baseUrl?: string) {
  const activeSubscriptions = new Map<number, number>();

  function resolveWsEndpoint(): string {
    if (baseUrl) return baseUrl;
    const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
    const envUrl = import.meta.env.VITE_WS_URL;
    if (envUrl) return envUrl;
    return `${protocol}//${window.location.host}/api/v1/ws`;
  }

  const core = createWsCore<IncomingEvents, OutgoingEvents>({
    url: resolveWsEndpoint,
    reconnect: {
      enabled: true,
      initialDelayMs: 1000,
      maxDelayMs: 10000,
      backoffMultiplier: 1.5,
    },
    onOpen: (socket) => {
      const token = authToken.get();
      if (!token) {
        socket.close(4001, "No auth token available");
        return;
      }

      socket.send(
        JSON.stringify({
          type: "auth",
          data: { token },
        }),
      );
    },
  });

  core.on("ready", () => {
    for (const [channelId, serverId] of activeSubscriptions.entries()) {
      core.send("channel.subscribe", {
        server_id: serverId,
        channel_id: channelId,
      });
    }
  });

  core.on("error", (errorData) => {
    if (errorData.code === "unauthorized") {
      console.warn("[WS] Session expired or unauthorized by server");
      authToken.clear();
      core.disconnect(4001, "Unauthorized");
    }
  });

  return {
    ...core,

    subscribeChannel(serverId: number, channelId: number): void {
      activeSubscriptions.set(channelId, serverId);
      core.send("channel.subscribe", {
        server_id: serverId,
        channel_id: channelId,
      });
    },

    unsubscribeChannel(serverId: number, channelId: number): void {
      activeSubscriptions.delete(channelId);
      core.send("channel.unsubscribe", {
        server_id: serverId,
        channel_id: channelId,
      });
    },

    logout(): void {
      activeSubscriptions.clear();
      core.disconnect(1000, "User logged out");
    },
  };
}

export const wsClient = createWsClient();
