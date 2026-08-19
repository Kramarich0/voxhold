export const channelKeys = {
  all: ["channel"] as const,
  list: (serverId: number) => [...channelKeys.all, "list", serverId] as const,
  detail: (serverId: number, channelId: number) =>
    [...channelKeys.all, "detail", serverId, channelId] as const,
};
