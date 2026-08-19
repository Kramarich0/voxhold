export const authKeys = {
  all: ["auth"] as const,
  instance: () => [...authKeys.all, "instance"] as const,
};
