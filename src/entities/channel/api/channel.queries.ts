import { queryOptions, useQuery } from "@tanstack/react-query";
import { channelKeys } from "../model/channel.keys";
import { channelHttp } from "./channel.http";

const STALE_TIME = 1000 * 60 * 5; // 10 minutes

export const channelsQueryOptions = (serverId: number) =>
  queryOptions({
    queryKey: channelKeys.list(serverId),
    queryFn: () => channelHttp.getChannels(serverId),
    staleTime: STALE_TIME,
  });

export function useChannelsQuery(serverId?: number | null) {
  const isEnabled = serverId != null && serverId > 0;

  return useQuery({
    ...channelsQueryOptions(serverId ?? 0),
    enabled: isEnabled,
  });
}
