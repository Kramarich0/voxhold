import { api } from "@/shared/api/client";
import type {
  AuthResponse,
  InstanceInfo,
  LoginPayload,
  RefreshResponse,
  RegisterPayload,
} from "../model/auth.types";

export const authApi = {
  getInstance: () => api.get<InstanceInfo>("/instance", { skipAuth: true }),

  login: (payload: LoginPayload) =>
    api.post<AuthResponse>("/auth/login", payload, { skipAuth: true }),

  register: (payload: RegisterPayload) =>
    api.post<AuthResponse>("/auth/register", payload, { skipAuth: true }),

  refresh: () => api.post<RefreshResponse>("/auth/refresh"),

  logout: () => api.post<void>("/auth/logout"),

  deleteAccount: () => api.delete<void>("/account"),
};
