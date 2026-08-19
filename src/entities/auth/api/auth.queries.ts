import { queryOptions, useQuery } from "@tanstack/react-query";
import { authApi } from "@/entities/auth/api/auth.api";
import { authKeys } from "@/entities/auth/model/auth.keys";

const STALE_TIME = 1000 * 60 * 10; // 10 minutes

export const instanceQueryOptions = () =>
  queryOptions({
    queryKey: authKeys.instance(),
    queryFn: authApi.getInstance,
    staleTime: STALE_TIME,
  });

export function useInstanceQuery() {
  return useQuery(instanceQueryOptions());
}
