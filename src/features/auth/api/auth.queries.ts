import { queryOptions, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "@tanstack/react-router";
import { toast } from "sonner";
import { authApi } from "@/entities/auth/api/auth.api";
import type { AuthResponse, LoginPayload, RegisterPayload } from "@/entities/auth/model/auth.types";
import { useClearAuthToken, useSetAuthToken } from "@/entities/auth/model/use-auth.store";

type AuthMode = "login" | "register";

type AuthPayloadMap = {
  login: LoginPayload;
  register: RegisterPayload;
};

const STALE_TIME = 1000 * 60 * 10; // 10 minutes

export const authKeys = {
  all: ["auth"] as const,
  instance: () => [...authKeys.all, "instance"] as const,
  me: () => [...authKeys.all, "me"] as const,
};

export const instanceQueryOptions = () =>
  queryOptions({
    queryKey: authKeys.instance(),
    queryFn: authApi.getInstance,
    staleTime: STALE_TIME,
  });

export function useInstanceQuery() {
  return useQuery(instanceQueryOptions());
}

export function useAuthMutation<TMode extends AuthMode>(mode: TMode) {
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const setToken = useSetAuthToken();

  return useMutation<AuthResponse, Error, AuthPayloadMap[TMode]>({
    mutationFn: (payload) =>
      mode === "login"
        ? authApi.login(payload as LoginPayload)
        : authApi.register(payload as RegisterPayload),
    onSuccess: (data) => {
      setToken(data.session.token);
      queryClient.setQueryData(authKeys.me(), {
        user_id: data.user.id,
        username: data.user.username,
        created_at: data.user.created_at,
        about: "",
        country_code: null,
        last_seen_at: null,
        updated_at: null,
      });
      toast.success(`${mode === "login" ? "Welcome back" : "Hello"}, ${data.user.username}!`);
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
    mutationFn: authApi.logout,
    onSuccess: () => {
      clearToken();
      queryClient.clear();
      navigate({ to: "/auth" });
    },
  });
}
