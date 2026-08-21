import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "@tanstack/react-router";
import { toast } from "sonner";
import { authHttp } from "@/entities/auth/api/auth.http";
import type { LoginPayload, RegisterPayload } from "@/entities/auth/model/auth.types";
import { useClearAuthToken, useSetAuthToken } from "@/entities/auth/model/use-auth.store";
import { meQueryOptions } from "@/entities/user/api/user.queries";

export function useLoginMutation() {
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const setToken = useSetAuthToken();

  return useMutation({
    mutationFn: (payload: LoginPayload) => authHttp.login(payload),
    onSuccess: async (data) => {
      setToken(data.session.token);

      await queryClient.prefetchQuery(meQueryOptions());

      toast.success(`Welcome back, ${data.user.username}!`);
      navigate({ to: "/" });
    },
    onError: (error) => toast.error(error.message),
  });
}

export function useRegisterMutation() {
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const setToken = useSetAuthToken();

  return useMutation({
    mutationFn: (payload: RegisterPayload) => authHttp.register(payload),
    onSuccess: async (data) => {
      setToken(data.session.token);

      await queryClient.prefetchQuery(meQueryOptions());

      toast.success(`Welcome to Voxhold, ${data.user.username}!`);
      navigate({ to: "/" });
    },
    onError: (error) => toast.error(error.message),
  });
}

export function useLogoutMutation() {
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const clearToken = useClearAuthToken();

  return useMutation({
    mutationFn: authHttp.logout,
    onSettled: () => {
      clearToken();
      queryClient.clear();
      navigate({ to: "/auth" });
    },
  });
}
