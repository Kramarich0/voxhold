import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { userHttp } from "@/entities/user/api/user.http";
import { userKeys } from "@/entities/user/model/user.keys";
import type { UpdateProfilePayload, UserProfile } from "@/entities/user/model/user.types";

export function useUpdateUserMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ payload }: { payload: UpdateProfilePayload }) =>
      userHttp.updateMeProfile(payload),
    onSuccess: (updatedProfile: UserProfile) => {
      queryClient.setQueryData(userKeys.me(), updatedProfile);
      toast.success("User Profile updated");
    },
    onError: (error) => toast.error(error.message),
  });
}
