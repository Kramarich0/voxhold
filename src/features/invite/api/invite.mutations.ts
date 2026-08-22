import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";
import { toast } from "sonner";
import { inviteHttp } from "@/entities/invite/api/invite.http";
import { inviteWs } from "@/entities/invite/api/invite.ws";
import { inviteKeys } from "@/entities/invite/model/invite.keys";
import type {
  CreateDirectInvitePayload,
  CreateInviteLinkPayload,
} from "@/entities/invite/model/invite.types";
import { serverKeys } from "@/entities/server/model/server.keys";
import type { IncomingInvite } from "@/shared/api/ws-client";

export function useCreateInviteLinkMutation(serverId: number) {
  return useMutation({
    mutationFn: (payload: CreateInviteLinkPayload) => inviteHttp.createLink(serverId, payload),
    onError: (error) => toast.error(error.message),
  });
}

export function useCreateDirectInviteMutation(serverId: number) {
  return useMutation({
    mutationFn: (payload: CreateDirectInvitePayload) =>
      inviteHttp.createDirectInvite(serverId, payload),
    onSuccess: (data) => {
      toast.success(`Invitation sent to user @${data.invitee_user_id}`);
    },
    onError: (error) => toast.error(error.message),
  });
}

export function useAcceptInviteMutation() {
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  return useMutation({
    mutationFn: (invite: IncomingInvite) => inviteHttp.acceptInvite(invite.id),
    onSuccess: (_, invite) => {
      queryClient.setQueryData<IncomingInvite[]>(inviteKeys.incoming(), (old = []) =>
        old.filter((i) => i.id !== invite.id),
      );
      queryClient.invalidateQueries({ queryKey: serverKeys.myServers() });
      toast.success(`Joined ${invite.server_name}!`);
      navigate({ to: "/channels/$serverId", params: { serverId: String(invite.server_id) } });
    },
    onError: (error) => toast.error(error.message),
  });
}

export function useDeclineInviteMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (inviteId: number) => inviteHttp.declineInvite(inviteId),
    onSuccess: (_, inviteId) => {
      queryClient.setQueryData<IncomingInvite[]>(inviteKeys.incoming(), (old = []) =>
        old.filter((i) => i.id !== inviteId),
      );
      toast.info("Invitation declined");
    },
    onError: (error) => toast.error(error.message),
  });
}

export function useInviteSubscriptions() {
  const queryClient = useQueryClient();

  useEffect(() => {
    const unsub = inviteWs.onInvitationReceived((invite) => {
      queryClient.setQueryData<IncomingInvite[]>(inviteKeys.incoming(), (old = []) => {
        if (old.some((i) => i.id === invite.id)) return old;
        return [invite, ...old];
      });

      toast.info(
        `You received an invite to join "${invite.server_name}" from @${invite.inviter_username}`,
        {
          duration: 8000,
        },
      );
    });

    return () => {
      unsub();
    };
  }, [queryClient]);
}

export function useAcceptInviteLinkMutation() {
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  return useMutation({
    mutationFn: (token: string) => inviteHttp.acceptLink(token),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: serverKeys.myServers() });
      toast.success("Welcome to the server!");
      navigate({
        to: "/channels/$serverId",
        params: { serverId: String(data.server_id) },
      });
    },
    onError: (error) => toast.error(error.message),
  });
}
