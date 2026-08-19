import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { messageApi } from "@/entities/message/api/message.api";
import { messageKeys } from "@/entities/message/model/message.keys";
import type {
  SendMessagePayload,
  UpdateMessagePayload,
} from "@/entities/message/model/message.types";

export function useSendMessageMutation(serverId: number, channelId: number) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: SendMessagePayload) =>
      messageApi.sendMessage(serverId, channelId, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: messageKeys.channel(serverId, channelId) });
    },
    onError: (error) => toast.error(error.message),
  });
}

export function useDeleteMessageMutation(serverId: number, channelId: number) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (messageId: number) => messageApi.deleteMessage(serverId, channelId, messageId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: messageKeys.channel(serverId, channelId) });
      toast.success("Message deleted");
    },
    onError: (error) => toast.error(error.message),
  });
}

export function useUpdateMessageMutation(serverId: number, channelId: number) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ messageId, payload }: { messageId: number; payload: UpdateMessagePayload }) =>
      messageApi.updateMessage(serverId, channelId, messageId, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: messageKeys.channel(serverId, channelId) });
    },
    onError: (error) => toast.error(error.message),
  });
}

export function usePinMessageMutation(serverId: number, channelId: number) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ messageId, pin }: { messageId: number; pin: boolean }) =>
      pin
        ? messageApi.pinMessage(serverId, channelId, messageId)
        : messageApi.unpinMessage(serverId, channelId, messageId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: messageKeys.channel(serverId, channelId) });
      queryClient.invalidateQueries({ queryKey: messageKeys.pins(serverId, channelId) });
      toast.success("Pin state updated");
    },
    onError: (error) => toast.error(error.message),
  });
}
