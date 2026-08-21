import { type InfiniteData, QueryClient } from "@tanstack/react-query";
import { beforeEach, describe, expect, it } from "vitest";
import { messageCache } from "./message.cache";
import { messageKeys } from "./message.keys";
import type { Message, MessagePage } from "./message.types";

describe("messageCache utility", () => {
  let queryClient: QueryClient;
  const serverId = 1;
  const channelId = 10;
  const cacheKey = messageKeys.channel(serverId, channelId);

  const createMockMessage = (id: number, content = `Message ${id}`): Message => ({
    id,
    channel_id: channelId,
    content,
    created_at: 1_700_000_000 + id,
    edited_at: null,
    author: {
      user_id: 1,
      username: "karen",
    },
  });

  const createMockCache = (pagesOfMessages: Message[][]): InfiniteData<MessagePage> => ({
    pageParams: pagesOfMessages.map((_, i) => (i === 0 ? undefined : i * 50)),
    pages: pagesOfMessages.map((messages) => ({
      messages,
      pagination: { next_before_id: null, has_more: false },
    })),
  });

  beforeEach(() => {
    queryClient = new QueryClient({
      defaultOptions: {
        queries: { retry: false },
      },
    });
  });

  describe("append", () => {
    it("appends a new message to the first page of the cache", () => {
      const msg1 = createMockMessage(1);
      createMockMessage(2);
      const initialCache = createMockCache([[msg1]]);
      queryClient.setQueryData(cacheKey, initialCache);

      const newMsg = createMockMessage(3, "Brand new message");
      messageCache.append(queryClient, serverId, channelId, newMsg);

      const updatedCache = queryClient.getQueryData<InfiniteData<MessagePage>>(cacheKey);
      expect(updatedCache?.pages[0]?.messages).toHaveLength(2);
      expect(updatedCache?.pages[0]?.messages[1]).toEqual(newMsg);
    });

    it("prevents duplication if the message already exists in the first page", () => {
      const msg1 = createMockMessage(1);
      const msg2 = createMockMessage(2);
      const initialCache = createMockCache([[msg1, msg2]]);
      queryClient.setQueryData(cacheKey, initialCache);

      messageCache.append(queryClient, serverId, channelId, msg2);

      const updatedCache = queryClient.getQueryData<InfiniteData<MessagePage>>(cacheKey);
      expect(updatedCache?.pages[0]?.messages).toHaveLength(2);
    });

    it("prevents duplication if the message exists in older paginated pages", () => {
      const msg1 = createMockMessage(1);
      const olderMsg = createMockMessage(99);
      const initialCache = createMockCache([[msg1], [olderMsg]]);
      queryClient.setQueryData(cacheKey, initialCache);

      messageCache.append(queryClient, serverId, channelId, olderMsg);

      const updatedCache = queryClient.getQueryData<InfiniteData<MessagePage>>(cacheKey);
      expect(updatedCache?.pages[0]?.messages).toHaveLength(1);
      expect(updatedCache?.pages[1]?.messages).toHaveLength(1);
    });

    it("handles uninitialized or empty cache gracefully without throwing", () => {
      const newMsg = createMockMessage(1);

      messageCache.append(queryClient, serverId, channelId, newMsg);

      const cache = queryClient.getQueryData(cacheKey);
      expect(cache).toBeUndefined();
    });
  });

  describe("update", () => {
    it("updates matching message content and edited_at timestamp in cache", () => {
      const msg1 = createMockMessage(1, "Original text");
      const msg2 = createMockMessage(2, "Second message");
      const initialCache = createMockCache([[msg1, msg2]]);
      queryClient.setQueryData(cacheKey, initialCache);

      const updatedMsg1: Message = {
        ...msg1,
        content: "Edited text",
        edited_at: 1_700_000_999,
      };

      messageCache.update(queryClient, serverId, channelId, updatedMsg1);

      const updatedCache = queryClient.getQueryData<InfiniteData<MessagePage>>(cacheKey);
      expect(updatedCache?.pages[0]?.messages[0]?.content).toBe("Edited text");
      expect(updatedCache?.pages[0]?.messages[0]?.edited_at).toBe(1_700_000_999);
      expect(updatedCache?.pages[0]?.messages[1]?.content).toBe("Second message");
    });

    it("updates message located on older paginated pages", () => {
      const page1Msg = createMockMessage(1);
      const page2Msg = createMockMessage(2, "Old page text");
      const initialCache = createMockCache([[page1Msg], [page2Msg]]);
      queryClient.setQueryData(cacheKey, initialCache);

      const updatedPage2Msg: Message = { ...page2Msg, content: "Updated page text" };
      messageCache.update(queryClient, serverId, channelId, updatedPage2Msg);

      const updatedCache = queryClient.getQueryData<InfiniteData<MessagePage>>(cacheKey);
      expect(updatedCache?.pages[1]?.messages[0]?.content).toBe("Updated page text");
    });

    it("does nothing if message id is not found in cache", () => {
      const msg1 = createMockMessage(1);
      const initialCache = createMockCache([[msg1]]);
      queryClient.setQueryData(cacheKey, initialCache);

      const nonExistentMsg = createMockMessage(999, "Non-existent");
      messageCache.update(queryClient, serverId, channelId, nonExistentMsg);

      const cache = queryClient.getQueryData<InfiniteData<MessagePage>>(cacheKey);
      expect(cache?.pages[0]?.messages).toEqual([msg1]);
    });
  });

  describe("delete", () => {
    it("removes message from cache by id", () => {
      const msg1 = createMockMessage(1);
      const msg2 = createMockMessage(2);
      const msg3 = createMockMessage(3);
      const initialCache = createMockCache([[msg1, msg2, msg3]]);
      queryClient.setQueryData(cacheKey, initialCache);

      messageCache.delete(queryClient, serverId, channelId, 2);

      const updatedCache = queryClient.getQueryData<InfiniteData<MessagePage>>(cacheKey);
      const remainingIds = updatedCache?.pages[0]?.messages.map((m) => m.id);
      expect(remainingIds).toEqual([1, 3]);
    });

    it("removes message located across different pages", () => {
      const msg1 = createMockMessage(1);
      const msg2 = createMockMessage(2);
      const initialCache = createMockCache([[msg1], [msg2]]);
      queryClient.setQueryData(cacheKey, initialCache);

      messageCache.delete(queryClient, serverId, channelId, 2);

      const updatedCache = queryClient.getQueryData<InfiniteData<MessagePage>>(cacheKey);
      expect(updatedCache?.pages[0]?.messages).toHaveLength(1);
      expect(updatedCache?.pages[1]?.messages).toHaveLength(0);
    });

    it("handles delete on non-existent message id safely", () => {
      const msg1 = createMockMessage(1);
      const initialCache = createMockCache([[msg1]]);
      queryClient.setQueryData(cacheKey, initialCache);

      messageCache.delete(queryClient, serverId, channelId, 999);

      const cache = queryClient.getQueryData<InfiniteData<MessagePage>>(cacheKey);
      expect(cache?.pages[0]?.messages).toHaveLength(1);
    });

    it("handles delete on uninitialized cache safely", () => {
      messageCache.delete(queryClient, serverId, channelId, 1);
      const cache = queryClient.getQueryData(cacheKey);
      expect(cache).toBeUndefined();
    });
  });
});
