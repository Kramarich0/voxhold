import { queryOptions, useQuery } from "@tanstack/react-query";
import { authKeys } from "../model/auth.keys";
import { authHttp } from "./auth.http";

const STALE_TIME = 1000 * 60 * 10; // 10 minutes

export const instanceQueryOptions = () =>
  queryOptions({
    queryKey: authKeys.instance(),
    queryFn: authHttp.getInstance,
    staleTime: STALE_TIME,
  });

export function useInstanceQuery() {
  return useQuery(instanceQueryOptions());
}
