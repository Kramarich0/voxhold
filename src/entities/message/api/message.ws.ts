import { type WsMessagePinnedData, type WsMessageRef, wsClient } from "@/shared/api/ws-client";
import type { Message } from "../model/message.types";

export const messageWs = {
  onCreated: (callback: (data: Message) => void): (() => void) => {
    return wsClient.on("message.created", callback);
  },

  onUpdated: (callback: (data: Message) => void): (() => void) => {
    return wsClient.on("message.updated", callback);
  },

  onDeleted: (callback: (data: WsMessageRef) => void): (() => void) => {
    return wsClient.on("message.deleted", callback);
  },

  onPinned: (callback: (data: WsMessagePinnedData) => void): (() => void) => {
    return wsClient.on("message.pinned", callback);
  },

  onUnpinned: (callback: (data: WsMessageRef) => void): (() => void) => {
    return wsClient.on("message.unpinned", callback);
  },
};
