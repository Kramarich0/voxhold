import { api } from "@/shared/api/client";
import type {
  Message,
  MessagePage,
  PinnedMessage,
  SendMessagePayload,
  UpdateMessagePayload,
} from "../model/message.types";

export const messageApi = {
  getMessages: (serverId: number, channelId: number, beforeId?: number, limit = 50) =>
    api.get<MessagePage>(`/servers/${serverId}/channels/${channelId}/messages`, {
      params: {
        limit,
        before_id: beforeId,
      },
    }),

  sendMessage: (serverId: number, channelId: number, payload: SendMessagePayload) =>
    api.post<Message>(`/servers/${serverId}/channels/${channelId}/messages`, payload),

  updateMessage: (
    serverId: number,
    channelId: number,
    messageId: number,
    payload: UpdateMessagePayload,
  ) =>
    api.patch<Message>(`/servers/${serverId}/channels/${channelId}/messages/${messageId}`, payload),

  deleteMessage: (serverId: number, channelId: number, messageId: number) =>
    api.delete<void>(`/servers/${serverId}/channels/${channelId}/messages/${messageId}`),

  pinMessage: (serverId: number, channelId: number, messageId: number) =>
    api.put<void>(`/servers/${serverId}/channels/${channelId}/messages/${messageId}/pin`),

  unpinMessage: (serverId: number, channelId: number, messageId: number) =>
    api.delete<void>(`/servers/${serverId}/channels/${channelId}/messages/${messageId}/pin`),

  getPinnedMessages: (serverId: number, channelId: number) =>
    api.get<PinnedMessage[]>(`/servers/${serverId}/channels/${channelId}/pins`),
};
