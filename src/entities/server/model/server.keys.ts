export const serverKeys = {
  all: ["server"] as const,
  myServers: () => [...serverKeys.all, "my"] as const,
  detail: (serverId: number) => [...serverKeys.all, "detail", serverId] as const,
  members: (serverId: number) => [...serverKeys.all, "members", serverId] as const,
};
