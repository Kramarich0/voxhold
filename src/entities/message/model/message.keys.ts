export const messageKeys = {
  all: ["message"] as const,
  channel: (serverId: number, channelId: number) =>
    [...messageKeys.all, "channel", serverId, channelId] as const,
  pins: (serverId: number, channelId: number) =>
    [...messageKeys.all, "pins", serverId, channelId] as const,
};
