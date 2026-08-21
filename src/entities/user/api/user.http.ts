import { http } from "@/shared/api/http-client";
import type { UpdateProfilePayload, UserProfile } from "../model/user.types";

export const userHttp = {
  getMeProfile: () => http.get<UserProfile>("/me/profile"),

  updateMeProfile: (payload: UpdateProfilePayload) =>
    http.patch<UserProfile>("/me/profile", payload),

  getUserProfile: (userId: number) => http.get<UserProfile>(`/users/${userId}/profile`),
};
