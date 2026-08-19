import { queryOptions, useQuery } from "@tanstack/react-query";
import { serverKeys } from "../model/server.keys";
import { serverApi } from "./server.api";

const STALE_TIME = 1000 * 60 * 5; // 10 minutes

export const myServersQueryOptions = () =>
  queryOptions({
    queryKey: serverKeys.myServers(),
    queryFn: serverApi.getMyServers,
    staleTime: STALE_TIME,
  });

export const serverMembersQueryOptions = (serverId: number) =>
  queryOptions({
    queryKey: serverKeys.members(serverId),
    queryFn: () => serverApi.getServerMembers(serverId),
    staleTime: STALE_TIME,
  });

export function useMyServersQuery() {
  return useQuery(myServersQueryOptions());
}

export function useServerMembersQuery(serverId: number | null | undefined) {
  const isEnabled = serverId != null && serverId > 0;

  return useQuery({
    ...serverMembersQueryOptions(serverId ?? 0),
    enabled: isEnabled,
  });
}
