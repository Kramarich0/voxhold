import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { serverHttp } from "@/entities/server/api/server.http";
import { serverCache } from "@/entities/server/model/server.cache";
import type {
  UpdateMemberRolePayload,
  UpdateServerPayload,
} from "@/entities/server/model/server.types";

export function useUpdateServerMutation(serverId: number) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ payload }: { payload: UpdateServerPayload }) =>
      serverHttp.updateServer(serverId, payload),
    onSuccess: (updatedServer) => {
      serverCache.updateServer(queryClient, updatedServer);
      toast.success("Server updated");
    },
    onError: (error) => toast.error(error.message),
  });
}

export function useUpdateMemberRoleMutation(serverId: number) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ userId, payload }: { userId: number; payload: UpdateMemberRolePayload }) =>
      serverHttp.updateMemberRole(serverId, userId, payload),
    onSuccess: (updatedMember) => {
      serverCache.updateMember(queryClient, serverId, updatedMember);
      toast.success(`Role updated to ${updatedMember.role} for @${updatedMember.username}`);
    },
    onError: (error) => toast.error(error.message),
  });
}

export function useBanMemberMutation(serverId: number) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ userId }: { userId: number; username?: string }) =>
      serverHttp.banMember(serverId, userId),
    onSuccess: (_, variables) => {
      serverCache.removeMember(queryClient, serverId, variables.userId);
      toast.success(
        variables.username ? `@${variables.username} has been banned` : "Member has been banned",
      );
    },
    onError: (error) => toast.error(error.message),
  });
}
