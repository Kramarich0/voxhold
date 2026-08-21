import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { act, renderHook } from "@testing-library/react";
import { createElement, type ReactNode } from "react";
import { toast } from "sonner";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { serverHttp } from "@/entities/server/api/server.http";
import { serverKeys } from "@/entities/server/model/server.keys";
import { useUpdateServerMutation } from "./server.mutations";

vi.mock("sonner", () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
  },
}));

vi.mock("@/entities/server/api/server.http", () => ({
  serverHttp: {
    updateServer: vi.fn(),
  },
}));

describe("server mutations", () => {
  let queryClient: QueryClient;
  const serverId = 1;

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

  describe("useUpdateServerMutation", () => {
    it("updates server cache and shows toast", async () => {
      const setQueryDataSpy = vi.spyOn(QueryClient.prototype, "setQueryData");
      const wrapper = createWrapper();
      vi.mocked(serverHttp.updateServer).mockResolvedValueOnce({
        id: serverId,
        name: "Voxhold Global",
        created_by: 1,
        created_at: 100,
      });

      const { result } = renderHook(() => useUpdateServerMutation(serverId), { wrapper });

      await act(async () => {
        await result.current.mutateAsync({ payload: { name: "Voxhold Global" } });
      });

      expect(serverHttp.updateServer).toHaveBeenCalledWith(serverId, {
        name: "Voxhold Global",
      });
      expect(setQueryDataSpy).toHaveBeenCalledWith(serverKeys.myServers(), expect.any(Function));
      expect(toast.success).toHaveBeenCalledWith("Server updated");
    });

    it("handles errors and shows error toast", async () => {
      const wrapper = createWrapper();
      vi.mocked(serverHttp.updateServer).mockRejectedValueOnce(new Error("Forbidden"));

      const { result } = renderHook(() => useUpdateServerMutation(serverId), { wrapper });

      await act(async () => {
        await result.current.mutateAsync({ payload: { name: "invalid" } }).catch(() => {});
      });

      expect(toast.error).toHaveBeenCalledWith("Forbidden");
    });
  });
});
