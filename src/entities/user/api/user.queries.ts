import { queryOptions, useQuery } from "@tanstack/react-query";
import { userKeys } from "../model/user.keys";
import { userApi } from "./user.api";

const STALE_TIME = 1000 * 60 * 5; // 10 minutes

export const meQueryOptions = () =>
  queryOptions({
    queryKey: userKeys.me(),
    queryFn: userApi.getMeProfile,
    staleTime: STALE_TIME,
  });

export const userProfileQueryOptions = (userId: number) =>
  queryOptions({
    queryKey: userKeys.detail(userId),
    queryFn: () => userApi.getUserProfile(userId),
    staleTime: STALE_TIME,
  });

export function useMeQuery() {
  return useQuery(meQueryOptions());
}

export function useUserProfileQuery(userId: number) {
  return useQuery(userProfileQueryOptions(userId));
}
