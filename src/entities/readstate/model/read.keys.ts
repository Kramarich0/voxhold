export const readKeys = {
  all: ["read"] as const,
  myReads: () => [...readKeys.all, "my"] as const,
  channelReads: (channelId: number) => [...readKeys.all, "channel", channelId] as const,
  channelLatestMessage: (channelId: number) =>
    [...readKeys.all, "latest-message", channelId] as const,
};
