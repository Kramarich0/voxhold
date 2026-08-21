import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { act, renderHook } from "@testing-library/react";
import { createElement, type ReactNode } from "react";
import { toast } from "sonner";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { userHttp } from "@/entities/user/api/user.http";
import { userKeys } from "@/entities/user/model/user.keys";
import { useUpdateUserMutation } from "./user.mutations";

vi.mock("sonner", () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
  },
}));

vi.mock("@/entities/user/api/user.http", () => ({
  userHttp: {
    updateMeProfile: vi.fn(),
  },
}));

describe("user mutations", () => {
  let queryClient: QueryClient;

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
  });

  describe("useUpdateUserMutation", () => {
    it("updates profile cache and shows toast", async () => {
      const setQueryDataSpy = vi.spyOn(QueryClient.prototype, "setQueryData");
      const wrapper = createWrapper();
      vi.mocked(userHttp.updateMeProfile).mockResolvedValueOnce({
        id: 1,
        username: "karen",
        created_at: 100,
        about: "Updated bio",
        country_code: "AM",
        last_seen_at: null,
        updated_at: 200,
      });

      const { result } = renderHook(() => useUpdateUserMutation(), { wrapper });

      await act(async () => {
        await result.current.mutateAsync({ payload: { about: "Updated bio" } });
      });

      expect(userHttp.updateMeProfile).toHaveBeenCalledWith({ about: "Updated bio" });
      expect(setQueryDataSpy).toHaveBeenCalledWith(userKeys.me(), {
        id: 1,
        username: "karen",
        created_at: 100,
        about: "Updated bio",
        country_code: "AM",
        last_seen_at: null,
        updated_at: 200,
      });
      expect(toast.success).toHaveBeenCalledWith("User Profile updated");
    });
  });
});
