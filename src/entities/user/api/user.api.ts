import { api } from "@/shared/api/client";
import type { UpdateProfilePayload, UserProfile } from "../model/user.types";

export const userApi = {
  getMeProfile: () => api.get<UserProfile>("/me/profile"),

  updateMeProfile: (payload: UpdateProfilePayload) =>
    api.patch<UserProfile>("/me/profile", payload),

  getUserProfile: (userId: number) => api.get<UserProfile>(`/users/${userId}/profile`),
};
