import { queryOptions, useQuery } from "@tanstack/react-query";
import { userKeys } from "../model/user.keys";
import { userHttp } from "./user.http";

const STALE_TIME = 1000 * 60 * 5; // 10 minutes

export const meQueryOptions = () =>
  queryOptions({
    queryKey: userKeys.me(),
    queryFn: userHttp.getMeProfile,
    staleTime: STALE_TIME,
  });

export const userProfileQueryOptions = (userId: number) =>
  queryOptions({
    queryKey: userKeys.detail(userId),
    queryFn: () => userHttp.getUserProfile(userId),
    staleTime: STALE_TIME,
  });

export function useMeQuery() {
  return useQuery(meQueryOptions());
}
// TODO: implement this endpoint
export function useUserProfileQuery(userId: number) {
  return useQuery(userProfileQueryOptions(userId));
}
