import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { act, renderHook } from "@testing-library/react";
import { createElement, type ReactNode } from "react";
import { toast } from "sonner";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { channelHttp } from "@/entities/channel/api/channel.http";
import { channelKeys } from "@/entities/channel/model/channel.keys";
import {
  useCreateChannelMutation,
  useDeleteChannelMutation,
  useUpdateChannelMutation,
} from "./channel.mutations";

vi.mock("sonner", () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
  },
}));

vi.mock("@/entities/channel/api/channel.http", () => ({
  channelHttp: {
    createChannel: vi.fn(),
    deleteChannel: vi.fn(),
    updateChannel: vi.fn(),
  },
}));

describe("channel mutations", () => {
  let queryClient: QueryClient;
  const serverId = 1;
  const channelId = 10;

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

  describe("useCreateChannelMutation", () => {
    it("creates channel, invalidates channels query, and shows success toast", async () => {
      const invalidateSpy = vi.spyOn(QueryClient.prototype, "invalidateQueries");
      const wrapper = createWrapper();
      vi.mocked(channelHttp.createChannel).mockResolvedValueOnce({
        id: channelId,
        server_id: serverId,
        name: "general",
        kind: "text",
        position: 0,
        created_by: 1,
        created_at: 100,
      });

      const { result } = renderHook(() => useCreateChannelMutation(serverId), { wrapper });

      await act(async () => {
        await result.current.mutateAsync({ name: "general", kind: "text" });
      });

      expect(channelHttp.createChannel).toHaveBeenCalledWith(serverId, {
        name: "general",
        kind: "text",
      });
      expect(invalidateSpy).toHaveBeenCalledWith({
        queryKey: channelKeys.list(serverId),
      });
      expect(toast.success).toHaveBeenCalledWith("Channel created successfully");
    });

    it("shows error toast on failure", async () => {
      const wrapper = createWrapper();
      vi.mocked(channelHttp.createChannel).mockRejectedValueOnce(new Error("Channel name taken"));

      const { result } = renderHook(() => useCreateChannelMutation(serverId), { wrapper });

      await act(async () => {
        await result.current.mutateAsync({ name: "general", kind: "text" }).catch(() => {});
      });

      expect(toast.error).toHaveBeenCalledWith("Channel name taken");
    });
  });

  describe("useDeleteChannelMutation", () => {
    it("deletes channel, invalidates list, and shows success toast", async () => {
      const invalidateSpy = vi.spyOn(QueryClient.prototype, "invalidateQueries");
      const wrapper = createWrapper();
      vi.mocked(channelHttp.deleteChannel).mockResolvedValueOnce();

      const { result } = renderHook(() => useDeleteChannelMutation(serverId), { wrapper });

      await act(async () => {
        await result.current.mutateAsync(channelId);
      });

      expect(channelHttp.deleteChannel).toHaveBeenCalledWith(serverId, channelId);
      expect(invalidateSpy).toHaveBeenCalledWith({
        queryKey: channelKeys.list(serverId),
      });
      expect(toast.success).toHaveBeenCalledWith("Channel deleted");
    });
  });

  describe("useUpdateChannelMutation", () => {
    it("updates channel, invalidates list, and shows success toast", async () => {
      const invalidateSpy = vi.spyOn(QueryClient.prototype, "invalidateQueries");
      const wrapper = createWrapper();
      vi.mocked(channelHttp.updateChannel).mockResolvedValueOnce({
        id: channelId,
        server_id: serverId,
        name: "new-name",
        kind: "text",
        position: 0,
        created_by: 1,
        created_at: 100,
      });

      const { result } = renderHook(() => useUpdateChannelMutation(serverId), { wrapper });

      await act(async () => {
        await result.current.mutateAsync({ channelId, payload: { name: "new-name" } });
      });

      expect(channelHttp.updateChannel).toHaveBeenCalledWith(serverId, channelId, {
        name: "new-name",
      });
      expect(invalidateSpy).toHaveBeenCalledWith({
        queryKey: channelKeys.list(serverId),
      });
      expect(toast.success).toHaveBeenCalledWith("Channel updated");
    });
  });
});
