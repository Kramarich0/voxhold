import { http } from "@/shared/api/http-client";
import type {
  ChannelRead,
  MarkChannelReadPayload,
  Message,
  MessageContext,
  MessagePage,
  PinnedMessage,
  SearchPage,
  SendMessagePayload,
  UpdateMessagePayload,
} from "../model/message.types";

export const messageHttp = {
  getMessages: (serverId: number, channelId: number, beforeId?: number, limit = 50) =>
    http.get<MessagePage>(`/servers/${serverId}/channels/${channelId}/messages`, {
      params: {
        limit,
        before_id: beforeId,
      },
    }),

  sendMessage: (serverId: number, channelId: number, payload: SendMessagePayload) =>
    http.post<Message>(`/servers/${serverId}/channels/${channelId}/messages`, payload),

  updateMessage: (
    serverId: number,
    channelId: number,
    messageId: number,
    payload: UpdateMessagePayload,
  ) =>
    http.patch<Message>(
      `/servers/${serverId}/channels/${channelId}/messages/${messageId}`,
      payload,
    ),

  deleteMessage: (serverId: number, channelId: number, messageId: number) =>
    http.delete<void>(`/servers/${serverId}/channels/${channelId}/messages/${messageId}`),

  pinMessage: (serverId: number, channelId: number, messageId: number) =>
    http.put<void>(`/servers/${serverId}/channels/${channelId}/messages/${messageId}/pin`),

  unpinMessage: (serverId: number, channelId: number, messageId: number) =>
    http.delete<void>(`/servers/${serverId}/channels/${channelId}/messages/${messageId}/pin`),

  getPinnedMessages: (serverId: number, channelId: number) =>
    http.get<PinnedMessage[]>(`/servers/${serverId}/channels/${channelId}/pins`),

  searchMessages: (serverId: number, query: string, beforeId?: number, limit = 25) =>
    http.get<SearchPage>(`/servers/${serverId}/messages/search`, {
      params: {
        q: query,
        limit,
        before_id: beforeId,
      },
    }),

  getMessageContext: (
    serverId: number,
    channelId: number,
    messageId: number,
    before = 25,
    after = 25,
  ) =>
    http.get<MessageContext>(
      `/servers/${serverId}/channels/${channelId}/messages/${messageId}/context`,
      {
        params: {
          before,
          after,
        },
      },
    ),

  markChannelAsRead: (serverId: number, channelId: number, payload: MarkChannelReadPayload) =>
    http.put<ChannelRead>(`/servers/${serverId}/channels/${channelId}/read`, payload),
};
