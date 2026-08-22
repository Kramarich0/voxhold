export const inviteKeys = {
  all: ["invite"] as const,
  incoming: () => [...inviteKeys.all, "incoming"] as const,
  resolve: (token: string) => [...inviteKeys.all, "resolve", token] as const,
};
