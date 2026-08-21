import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { channelHttp } from "@/entities/channel/api/channel.http";
import { channelCache } from "@/entities/channel/model/channel.cache";
import type {
  CreateChannelPayload,
  UpdateChannelPayload,
} from "@/entities/channel/model/channel.types";

export function useCreateChannelMutation(serverId: number) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: CreateChannelPayload) => channelHttp.createChannel(serverId, payload),
    onSuccess: (createdChannel) => {
      channelCache.add(queryClient, serverId, createdChannel);
      toast.success("Channel created successfully");
    },
    onError: (error) => toast.error(error.message),
  });
}

export function useDeleteChannelMutation(serverId: number) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (channelId: number) => channelHttp.deleteChannel(serverId, channelId),
    onSuccess: (_, channelId) => {
      channelCache.remove(queryClient, serverId, channelId);
      toast.success("Channel deleted");
    },
    onError: (error) => toast.error(error.message),
  });
}

export function useUpdateChannelMutation(serverId: number) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ channelId, payload }: { channelId: number; payload: UpdateChannelPayload }) =>
      channelHttp.updateChannel(serverId, channelId, payload),
    onSuccess: (updatedChannel) => {
      channelCache.update(queryClient, serverId, updatedChannel);
      toast.success("Channel updated");
    },
    onError: (error) => toast.error(error.message),
  });
}
