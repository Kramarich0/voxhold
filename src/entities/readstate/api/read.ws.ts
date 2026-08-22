import {
  type WsChannelReadData,
  type WsChannelReadSnapshotData,
  wsClient,
} from "@/shared/api/ws-client";

export const readWs = {
  onSnapshot: (callback: (data: { reads: WsChannelReadData[] }) => void): (() => void) => {
    return wsClient.on("read.snapshot", callback);
  },

  onChannelRead: (callback: (data: WsChannelReadData) => void): (() => void) => {
    return wsClient.on("channel.read", callback);
  },

  onChannelReadSnapshot: (callback: (data: WsChannelReadSnapshotData) => void): (() => void) => {
    return wsClient.on("channel.read_snapshot", callback);
  },
};
