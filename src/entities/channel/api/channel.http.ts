import { http } from "@/shared/api/http-client";
import type { Channel, CreateChannelPayload, UpdateChannelPayload } from "../model/channel.types";

export const channelHttp = {
  getChannels: (serverId: number) => http.get<Channel[]>(`/servers/${serverId}/channels`),

  createChannel: (serverId: number, payload: CreateChannelPayload) =>
    http.post<Channel>(`/servers/${serverId}/channels`, payload),

  updateChannel: (serverId: number, channelId: number, payload: UpdateChannelPayload) =>
    http.patch<Channel>(`/servers/${serverId}/channels/${channelId}`, payload),

  deleteChannel: (serverId: number, channelId: number) =>
    http.delete<void>(`/servers/${serverId}/channels/${channelId}`),
};
