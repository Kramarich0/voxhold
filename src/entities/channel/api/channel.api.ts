import { api } from "@/shared/api/client";
import type { Channel, CreateChannelPayload, UpdateChannelPayload } from "../model/channel.types";

export const channelApi = {
  getChannels: (serverId: number) => api.get<Channel[]>(`/servers/${serverId}/channels`),

  createChannel: (serverId: number, payload: CreateChannelPayload) =>
    api.post<Channel>(`/servers/${serverId}/channels`, payload),

  updateChannel: (serverId: number, channelId: number, payload: UpdateChannelPayload) =>
    api.patch<Channel>(`/servers/${serverId}/channels/${channelId}`, payload),

  deleteChannel: (serverId: number, channelId: number) =>
    api.delete<void>(`/servers/${serverId}/channels/${channelId}`),
};
