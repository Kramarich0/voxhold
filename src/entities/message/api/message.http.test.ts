import { beforeEach, describe, expect, it, vi } from "vitest";
import { http } from "@/shared/api/http-client";
import { messageHttp } from "./message.http";

vi.mock("@/shared/api/http-client", () => ({
  http: {
    get: vi.fn(),
    post: vi.fn(),
    patch: vi.fn(),
    put: vi.fn(),
    delete: vi.fn(),
  },
}));

describe("messageHttp api client", () => {
  const serverId = 1;
  const channelId = 10;
  const messageId = 100;

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("fetches messages with pagination query parameters", async () => {
    await messageHttp.getMessages(serverId, channelId, 500, 30);
    expect(http.get).toHaveBeenCalledWith(`/servers/${serverId}/channels/${channelId}/messages`, {
      params: { limit: 30, before_id: 500 },
    });
  });

  it("sends a message", async () => {
    const payload = { content: "Hello world" };
    await messageHttp.sendMessage(serverId, channelId, payload);
    expect(http.post).toHaveBeenCalledWith(
      `/servers/${serverId}/channels/${channelId}/messages`,
      payload,
    );
  });

  it("updates message content", async () => {
    const payload = { content: "Updated content" };
    await messageHttp.updateMessage(serverId, channelId, messageId, payload);
    expect(http.patch).toHaveBeenCalledWith(
      `/servers/${serverId}/channels/${channelId}/messages/${messageId}`,
      payload,
    );
  });

  it("deletes a message", async () => {
    await messageHttp.deleteMessage(serverId, channelId, messageId);
    expect(http.delete).toHaveBeenCalledWith(
      `/servers/${serverId}/channels/${channelId}/messages/${messageId}`,
    );
  });

  it("pins and unpins a message", async () => {
    await messageHttp.pinMessage(serverId, channelId, messageId);
    expect(http.put).toHaveBeenCalledWith(
      `/servers/${serverId}/channels/${channelId}/messages/${messageId}/pin`,
    );

    await messageHttp.unpinMessage(serverId, channelId, messageId);
    expect(http.delete).toHaveBeenCalledWith(
      `/servers/${serverId}/channels/${channelId}/messages/${messageId}/pin`,
    );
  });

  it("fetches pinned messages", async () => {
    await messageHttp.getPinnedMessages(serverId, channelId);
    expect(http.get).toHaveBeenCalledWith(`/servers/${serverId}/channels/${channelId}/pins`);
  });

  it("searches messages across the server", async () => {
    await messageHttp.searchMessages(serverId, "test query", 200, 25);
    expect(http.get).toHaveBeenCalledWith(`/servers/${serverId}/messages/search`, {
      params: { q: "test query", limit: 25, before_id: 200 },
    });
  });

  it("fetches message context surrounding a target message", async () => {
    await messageHttp.getMessageContext(serverId, channelId, messageId, 15, 15);
    expect(http.get).toHaveBeenCalledWith(
      `/servers/${serverId}/channels/${channelId}/messages/${messageId}/context`,
      { params: { before: 15, after: 15 } },
    );
  });

  it("marks channel as read", async () => {
    const payload = { last_read_message_id: 50 };
    await messageHttp.markChannelAsRead(serverId, channelId, payload);
    expect(http.put).toHaveBeenCalledWith(
      `/servers/${serverId}/channels/${channelId}/read`,
      payload,
    );
  });
});
