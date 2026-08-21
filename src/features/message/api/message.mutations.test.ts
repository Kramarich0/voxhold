import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { act, renderHook } from "@testing-library/react";
import { createElement, type ReactNode } from "react";
import { toast } from "sonner";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { messageHttp } from "@/entities/message/api/message.http";
import { messageCache } from "@/entities/message/model/message.cache";
import { messageKeys } from "@/entities/message/model/message.keys";
import type { Message } from "@/entities/message/model/message.types";
import {
  useDeleteMessageMutation,
  useMarkChannelAsReadMutation,
  usePinMessageMutation,
  useSendMessageMutation,
  useUpdateMessageMutation,
} from "./message.mutations";

vi.mock("sonner", () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
  },
}));

vi.mock("@/entities/message/api/message.http", () => ({
  messageHttp: {
    sendMessage: vi.fn(),
    updateMessage: vi.fn(),
    deleteMessage: vi.fn(),
    pinMessage: vi.fn(),
    unpinMessage: vi.fn(),
    markChannelAsRead: vi.fn(),
  },
}));

vi.mock("@/entities/message/model/message.cache", () => ({
  messageCache: {
    append: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
  },
}));

describe("message mutations", () => {
  let queryClient: QueryClient;
  const serverId = 1;
  const channelId = 10;
  const messageId = 100;

  const mockMessage: Message = {
    id: messageId,
    channel_id: channelId,
    content: "Hello",
    created_at: 100,
    edited_at: null,
    author: { user_id: 1, username: "karen" },
  };

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

  describe("useSendMessageMutation", () => {
    it("sends message and appends it to cache", async () => {
      const wrapper = createWrapper();
      vi.mocked(messageHttp.sendMessage).mockResolvedValueOnce(mockMessage);

      const { result } = renderHook(() => useSendMessageMutation(serverId, channelId), {
        wrapper,
      });

      await act(async () => {
        await result.current.mutateAsync({ content: "Hello" });
      });

      expect(messageHttp.sendMessage).toHaveBeenCalledWith(serverId, channelId, {
        content: "Hello",
      });
      expect(messageCache.append).toHaveBeenCalledWith(
        queryClient,
        serverId,
        channelId,
        mockMessage,
      );
    });
  });

  describe("useUpdateMessageMutation", () => {
    it("updates message and syncs update in cache", async () => {
      const wrapper = createWrapper();
      const updated = { ...mockMessage, content: "Edited" };
      vi.mocked(messageHttp.updateMessage).mockResolvedValueOnce(updated);

      const { result } = renderHook(() => useUpdateMessageMutation(serverId, channelId), {
        wrapper,
      });

      await act(async () => {
        await result.current.mutateAsync({ messageId, payload: { content: "Edited" } });
      });

      expect(messageHttp.updateMessage).toHaveBeenCalledWith(serverId, channelId, messageId, {
        content: "Edited",
      });
      expect(messageCache.update).toHaveBeenCalledWith(queryClient, serverId, channelId, updated);
    });
  });

  describe("useDeleteMessageMutation", () => {
    it("deletes message, removes from cache, and shows toast", async () => {
      const wrapper = createWrapper();
      vi.mocked(messageHttp.deleteMessage).mockResolvedValueOnce();

      const { result } = renderHook(() => useDeleteMessageMutation(serverId, channelId), {
        wrapper,
      });

      await act(async () => {
        await result.current.mutateAsync(messageId);
      });

      expect(messageHttp.deleteMessage).toHaveBeenCalledWith(serverId, channelId, messageId);
      expect(messageCache.delete).toHaveBeenCalledWith(queryClient, serverId, channelId, messageId);
      expect(toast.success).toHaveBeenCalledWith("Message deleted");
    });
  });

  describe("usePinMessageMutation", () => {
    it("pins message and invalidates pins cache", async () => {
      const invalidateSpy = vi.spyOn(QueryClient.prototype, "invalidateQueries");
      const wrapper = createWrapper();
      vi.mocked(messageHttp.pinMessage).mockResolvedValueOnce();

      const { result } = renderHook(() => usePinMessageMutation(serverId, channelId), { wrapper });

      await act(async () => {
        await result.current.mutateAsync({ messageId, pin: true });
      });

      expect(messageHttp.pinMessage).toHaveBeenCalledWith(serverId, channelId, messageId);
      expect(invalidateSpy).toHaveBeenCalledWith({
        queryKey: messageKeys.pins(serverId, channelId),
      });
    });

    it("unpins message and invalidates pins cache", async () => {
      const invalidateSpy = vi.spyOn(QueryClient.prototype, "invalidateQueries");
      const wrapper = createWrapper();
      vi.mocked(messageHttp.unpinMessage).mockResolvedValueOnce();

      const { result } = renderHook(() => usePinMessageMutation(serverId, channelId), { wrapper });

      await act(async () => {
        await result.current.mutateAsync({ messageId, pin: false });
      });

      expect(messageHttp.unpinMessage).toHaveBeenCalledWith(serverId, channelId, messageId);
      expect(invalidateSpy).toHaveBeenCalledWith({
        queryKey: messageKeys.pins(serverId, channelId),
      });
    });
  });

  describe("useMarkChannelAsReadMutation", () => {
    it("calls markChannelAsRead endpoint", async () => {
      const wrapper = createWrapper();
      const readData = {
        server_id: serverId,
        channel_id: channelId,
        user_id: 1,
        last_read_message_id: messageId,
        updated_at: 100,
      };
      vi.mocked(messageHttp.markChannelAsRead).mockResolvedValueOnce(readData);

      const { result } = renderHook(() => useMarkChannelAsReadMutation(serverId, channelId), {
        wrapper,
      });

      await act(async () => {
        await result.current.mutateAsync({ last_read_message_id: messageId });
      });

      expect(messageHttp.markChannelAsRead).toHaveBeenCalledWith(serverId, channelId, {
        last_read_message_id: messageId,
      });
    });
  });
});
