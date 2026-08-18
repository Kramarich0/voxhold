import { create } from "zustand";
import { configureApiAuth } from "@/shared/api/client";

type AuthStore = {
  token: string | null;
  actions: {
    setToken: (token: string | null) => void;
    clearToken: () => void;
  };
};

export const useAuthStore = create<AuthStore>((set) => ({
  token: null,
  actions: {
    setToken: (token) => set({ token }),
    clearToken: () => set({ token: null }),
  },
}));

export const useAuthToken = () => useAuthStore((state) => state.token);
export const useSetAuthToken = () => useAuthStore((state) => state.actions.setToken);
export const useClearAuthToken = () => useAuthStore((state) => state.actions.clearToken);

configureApiAuth(
  () => useAuthStore.getState().token,
  () => useAuthStore.getState().actions.clearToken(),
);
