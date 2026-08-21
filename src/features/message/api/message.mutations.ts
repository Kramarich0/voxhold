import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { messageHttp } from "@/entities/message/api/message.http";
import { messageCache } from "@/entities/message/model/message.cache";
import { messageKeys } from "@/entities/message/model/message.keys";
import type {
  MarkChannelReadPayload,
  SendMessagePayload,
  UpdateMessagePayload,
} from "@/entities/message/model/message.types";

export function useSendMessageMutation(serverId: number, channelId: number) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: SendMessagePayload) =>
      messageHttp.sendMessage(serverId, channelId, payload),
    onSuccess: (newMessage) => {
      messageCache.append(queryClient, serverId, channelId, newMessage);
    },
    onError: (error) => toast.error(error.message),
  });
}

export function useUpdateMessageMutation(serverId: number, channelId: number) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ messageId, payload }: { messageId: number; payload: UpdateMessagePayload }) =>
      messageHttp.updateMessage(serverId, channelId, messageId, payload),
    onSuccess: (updatedMessage) => {
      messageCache.update(queryClient, serverId, channelId, updatedMessage);
    },
    onError: (error) => toast.error(error.message),
  });
}

export function useDeleteMessageMutation(serverId: number, channelId: number) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (messageId: number) => messageHttp.deleteMessage(serverId, channelId, messageId),
    onSuccess: (_, messageId) => {
      messageCache.delete(queryClient, serverId, channelId, messageId);
      toast.success("Message deleted");
    },
    onError: (error) => toast.error(error.message),
  });
}

export function usePinMessageMutation(serverId: number, channelId: number) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ messageId, pin }: { messageId: number; pin: boolean }) =>
      pin
        ? messageHttp.pinMessage(serverId, channelId, messageId)
        : messageHttp.unpinMessage(serverId, channelId, messageId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: messageKeys.pins(serverId, channelId) });
    },
    onError: (error) => toast.error(error.message),
  });
}

export function useMarkChannelAsReadMutation(serverId: number, channelId: number) {
  return useMutation({
    mutationFn: (payload: MarkChannelReadPayload) =>
      messageHttp.markChannelAsRead(serverId, channelId, payload),
  });
}
