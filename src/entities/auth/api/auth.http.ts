import { http } from "@/shared/api/http-client";
import type {
  AuthResponse,
  InstanceInfo,
  LoginPayload,
  RefreshResponse,
  RegisterPayload,
} from "../model/auth.types";

export const authHttp = {
  getInstance: () => http.get<InstanceInfo>("/instance", { skipAuth: true }),

  login: (payload: LoginPayload) =>
    http.post<AuthResponse>("/auth/login", payload, { skipAuth: true }),

  register: (payload: RegisterPayload) =>
    http.post<AuthResponse>("/auth/register", payload, { skipAuth: true }),

  refresh: () => http.post<RefreshResponse>("/auth/refresh"),

  logout: () => http.post<void>("/auth/logout"),

  // TODO: implement this endpoint
  deleteAccount: () => http.delete<void>("/account"),
};
