import { queryOptions, useQuery } from "@tanstack/react-query";
import { inviteKeys } from "../model/invite.keys";
import { inviteHttp } from "./invite.http";

export const incomingInvitesQueryOptions = () =>
  queryOptions({
    queryKey: inviteKeys.incoming(),
    queryFn: inviteHttp.getIncomingInvites,
    staleTime: 1000 * 60, // 1 min
  });

export function useIncomingInvitesQuery() {
  return useQuery(incomingInvitesQueryOptions());
}

export const resolveInviteQueryOptions = (token: string) =>
  queryOptions({
    queryKey: inviteKeys.resolve(token),
    queryFn: () => inviteHttp.resolveLink(token),
    staleTime: 1000 * 30, // 30 sec
    retry: false,
  });

export function useResolveInviteQuery(token: string) {
  return useQuery(resolveInviteQueryOptions(token));
}
