import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { serverHttp } from "@/entities/server/api/server.http";
import { serverCache } from "@/entities/server/model/server.cache";
import type { UpdateServerPayload } from "@/entities/server/model/server.types";

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
