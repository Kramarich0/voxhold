export const messageKeys = {
  all: ["message"] as const,
  channel: (serverId: number, channelId: number) =>
    [...messageKeys.all, "channel", serverId, channelId] as const,
  pins: (serverId: number, channelId: number) =>
    [...messageKeys.all, "pins", serverId, channelId] as const,
  search: (serverId: number, query: string) =>
    [...messageKeys.all, "search", serverId, query] as const,
  context: (serverId: number, channelId: number, messageId: number) =>
    [...messageKeys.all, "context", serverId, channelId, messageId] as const,
};
