import { queryOptions, useQuery } from "@tanstack/react-query";
import { serverKeys } from "../model/server.keys";
import { serverHttp } from "./server.http";

const STALE_TIME = 1000 * 60 * 5; // 10 minutes

export const myServersQueryOptions = () =>
  queryOptions({
    queryKey: serverKeys.myServers(),
    queryFn: serverHttp.getMyServers,
    staleTime: STALE_TIME,
  });

export const serverMembersQueryOptions = (serverId: number) =>
  queryOptions({
    queryKey: serverKeys.members(serverId),
    queryFn: () => serverHttp.getServerMembers(serverId),
    staleTime: STALE_TIME,
  });

export function useMyServersQuery() {
  return useQuery(myServersQueryOptions());
}

export function useServerMembersQuery(serverId?: number | null) {
  const isEnabled = serverId != null && serverId > 0;

  return useQuery({
    ...serverMembersQueryOptions(serverId ?? 0),
    enabled: isEnabled,
  });
}
