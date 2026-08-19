import { useAuthTokenStore } from "@/shared/api/auth-token";

export const useAuthStore = useAuthTokenStore;

export const useAuthToken = () => useAuthTokenStore((state) => state.token);
export const useSetAuthToken = () => useAuthTokenStore((state) => state.setToken);
export const useClearAuthToken = () => useAuthTokenStore((state) => state.clearToken);
