import {
  type WsChannelReadData,
  type WsChannelReadSnapshotData,
  type WsChannelRef,
  wsClient,
} from "@/shared/api/ws-client";
import type { Channel } from "../model/channel.types";

export const channelWs = {
  subscribe: (serverId: number, channelId: number): void => {
    wsClient.subscribeChannel(serverId, channelId);
  },

  unsubscribe: (serverId: number, channelId: number): void => {
    wsClient.unsubscribeChannel(serverId, channelId);
  },

  onRead: (callback: (data: WsChannelReadData) => void): (() => void) => {
    return wsClient.on("channel.read", callback);
  },

  onReadSnapshot: (callback: (data: WsChannelReadSnapshotData) => void): (() => void) => {
    return wsClient.on("channel.read_snapshot", callback);
  },

  onCreated: (callback: (data: Channel) => void): (() => void) => {
    return wsClient.on("channel.created", callback);
  },

  onUpdated: (callback: (data: Channel) => void): (() => void) => {
    return wsClient.on("channel.updated", callback);
  },

  onDeleted: (callback: (data: WsChannelRef) => void): (() => void) => {
    return wsClient.on("channel.deleted", callback);
  },
};
