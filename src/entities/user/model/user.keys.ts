export const userKeys = {
  all: ["user"] as const,
  me: () => [...userKeys.all, "me"] as const,
  detail: (userId: number) => [...userKeys.all, "detail", userId] as const,
};
