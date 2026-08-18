import { api } from "@/shared/api/client";
import type {
  AuthResponse,
  InstanceInfo,
  LoginPayload,
  RefreshResponse,
  RegisterPayload,
} from "../model/auth.types";

export const authApi = {
  getInstance: () => api.get<InstanceInfo>("/instance"),

  login: (payload: LoginPayload) => api.post<AuthResponse>("/auth/login", payload),

  register: (payload: RegisterPayload) => api.post<AuthResponse>("/auth/register", payload),

  refresh: () => api.post<RefreshResponse>("/auth/refresh"),

  logout: () => api.post<void>("/auth/logout"),

  deleteAccount: () => api.delete<void>("/account"),
};
