import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { channelApi } from "@/entities/channel/api/channel.api";
import { channelKeys } from "@/entities/channel/model/channel.keys";
import type {
  CreateChannelPayload,
  UpdateChannelPayload,
} from "@/entities/channel/model/channel.types";

export function useCreateChannelMutation(serverId: number) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: CreateChannelPayload) => channelApi.createChannel(serverId, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: channelKeys.list(serverId) });
      toast.success("Channel created successfully");
    },
    onError: (error) => toast.error(error.message),
  });
}

export function useDeleteChannelMutation(serverId: number) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (channelId: number) => channelApi.deleteChannel(serverId, channelId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: channelKeys.list(serverId) });
      toast.success("Channel deleted");
    },
    onError: (error) => toast.error(error.message),
  });
}

export function useUpdateChannelMutation(serverId: number) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ channelId, payload }: { channelId: number; payload: UpdateChannelPayload }) =>
      channelApi.updateChannel(serverId, channelId, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: channelKeys.list(serverId) });
      toast.success("Channel updated");
    },
    onError: (error) => toast.error(error.message),
  });
}
