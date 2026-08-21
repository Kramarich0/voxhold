import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { act, renderHook } from "@testing-library/react";
import { createElement, type ReactNode } from "react";
import { toast } from "sonner";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { authHttp } from "@/entities/auth/api/auth.http";
import * as authStore from "@/entities/auth/model/use-auth.store";
import { useLoginMutation, useLogoutMutation, useRegisterMutation } from "./auth.mutations";

const mockNavigate = vi.fn();

vi.mock("@tanstack/react-router", () => ({
  useNavigate: () => mockNavigate,
}));

vi.mock("sonner", () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
  },
}));

vi.mock("@/entities/auth/api/auth.http", () => ({
  authHttp: {
    login: vi.fn(),
    register: vi.fn(),
    logout: vi.fn(),
  },
}));

describe("auth mutations", () => {
  let queryClient: QueryClient;
  const mockSetToken = vi.fn();
  const mockClearToken = vi.fn();

  const createWrapper = () => {
    queryClient = new QueryClient({
      defaultOptions: {
        queries: { retry: false },
        mutations: { retry: false },
      },
    });
    return ({ children }: { children: ReactNode }) =>
      createElement(QueryClientProvider, { client: queryClient }, children);
  };

  beforeEach(() => {
    vi.clearAllMocks();
    vi.spyOn(authStore, "useSetAuthToken").mockReturnValue(mockSetToken);
    vi.spyOn(authStore, "useClearAuthToken").mockReturnValue(mockClearToken);
  });

  describe("useLoginMutation", () => {
    it("logs in, sets token, prefetches profile, toasts success, and navigates to '/'", async () => {
      const wrapper = createWrapper();
      const authResponse = {
        user: { id: 1, username: "karen", created_at: 100 },
        session: { token: "jwt_token_123", expires_at: 9999 },
      };
      vi.mocked(authHttp.login).mockResolvedValueOnce(authResponse);

      const { result } = renderHook(() => useLoginMutation(), { wrapper });

      await act(async () => {
        await result.current.mutateAsync({ username: "karen", password: "pass" });
      });

      expect(authHttp.login).toHaveBeenCalledWith({ username: "karen", password: "pass" });
      expect(mockSetToken).toHaveBeenCalledWith("jwt_token_123");
      expect(toast.success).toHaveBeenCalledWith("Welcome back, karen!");
      expect(mockNavigate).toHaveBeenCalledWith({ to: "/" });
    });

    it("handles login failure with toast error", async () => {
      const wrapper = createWrapper();
      vi.mocked(authHttp.login).mockRejectedValueOnce(new Error("Invalid credentials"));

      const { result } = renderHook(() => useLoginMutation(), { wrapper });

      await act(async () => {
        await result.current.mutateAsync({ username: "karen", password: "wrong" }).catch(() => {});
      });

      expect(toast.error).toHaveBeenCalledWith("Invalid credentials");
      expect(mockSetToken).not.toHaveBeenCalled();
    });
  });

  describe("useRegisterMutation", () => {
    it("registers user, sets token, toasts welcome, and navigates to '/'", async () => {
      const wrapper = createWrapper();
      const authResponse = {
        user: { id: 2, username: "alex", created_at: 100 },
        session: { token: "jwt_token_456", expires_at: 9999 },
      };
      vi.mocked(authHttp.register).mockResolvedValueOnce(authResponse);

      const { result } = renderHook(() => useRegisterMutation(), { wrapper });

      await act(async () => {
        await result.current.mutateAsync({
          username: "alex",
          password: "password123",
          password_confirm: "password123",
          invite_token: "token",
        });
      });

      expect(mockSetToken).toHaveBeenCalledWith("jwt_token_456");
      expect(toast.success).toHaveBeenCalledWith("Welcome to Voxhold, alex!");
      expect(mockNavigate).toHaveBeenCalledWith({ to: "/" });
    });
  });

  describe("useLogoutMutation", () => {
    it("clears token, clears query client, and redirects to '/auth'", async () => {
      const wrapper = createWrapper();
      const clearSpy = vi.spyOn(queryClient, "clear");
      vi.mocked(authHttp.logout).mockResolvedValueOnce();

      const { result } = renderHook(() => useLogoutMutation(), { wrapper });

      await act(async () => {
        await result.current.mutateAsync();
      });

      expect(authHttp.logout).toHaveBeenCalled();
      expect(mockClearToken).toHaveBeenCalled();
      expect(clearSpy).toHaveBeenCalled();
      expect(mockNavigate).toHaveBeenCalledWith({ to: "/auth" });
    });
  });
});
