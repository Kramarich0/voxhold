import { authToken } from "./auth-token";
import { createHttpClient } from "./http-core";

const BASE_URL = import.meta.env.VITE_API_URL ?? "/api/v1";

export const http = createHttpClient({
  baseUrl: BASE_URL,
  defaultTimeoutMs: 15000,

  getAccessToken: () => authToken.get(),

  refreshAccessToken: async () => {
    const currentToken = authToken.get();
    if (currentToken == null || currentToken === "") return null;

    try {
      const response = await fetch(`${BASE_URL}/auth/refresh`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${currentToken}`,
        },
      });

      if (!response.ok) {
        authToken.clear();
        return null;
      }

      const data = (await response.json()) as { token: string; expires_at: number };
      authToken.set(data.token);
      return data.token;
    } catch {
      return null;
    }
  },

  onUnauthorized: () => {
    authToken.clear();
  },
});
