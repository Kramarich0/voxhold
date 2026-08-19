import { create } from "zustand";
import { persist } from "zustand/middleware";

const STORAGE_KEY = "voxhold_session_token";

type AuthTokenState = {
  token: string | null;
  setToken: (token: string | null) => void;
  clearToken: () => void;
};

export const useAuthTokenStore = create<AuthTokenState>()(
  persist(
    (set) => ({
      token: null,
      setToken: (token) => set({ token }),
      clearToken: () => set({ token: null }),
    }),
    {
      name: STORAGE_KEY,
    },
  ),
);

export const authToken = {
  get: (): string | null => useAuthTokenStore.getState().token,
  set: (token: string | null): void => useAuthTokenStore.getState().setToken(token),
  clear: (): void => useAuthTokenStore.getState().clearToken(),
};
