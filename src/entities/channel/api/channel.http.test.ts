import { beforeEach, describe, expect, it, vi } from "vitest";
import { http } from "@/shared/api/http-client";
import { channelHttp } from "./channel.http";

vi.mock("@/shared/api/http-client", () => ({
  http: {
    get: vi.fn(),
    post: vi.fn(),
    patch: vi.fn(),
    delete: vi.fn(),
  },
}));

describe("channelHttp api client", () => {
  const serverId = 1;
  const channelId = 10;

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("fetches channels list for server", async () => {
    await channelHttp.getChannels(serverId);
    expect(http.get).toHaveBeenCalledWith(`/servers/${serverId}/channels`);
  });

  it("creates a new channel with payload", async () => {
    const payload = { name: "general", kind: "text" as const };
    await channelHttp.createChannel(serverId, payload);
    expect(http.post).toHaveBeenCalledWith(`/servers/${serverId}/channels`, payload);
  });

  it("updates existing channel name with patch request", async () => {
    const payload = { name: "announcements" };
    await channelHttp.updateChannel(serverId, channelId, payload);
    expect(http.patch).toHaveBeenCalledWith(`/servers/${serverId}/channels/${channelId}`, payload);
  });

  it("deletes channel by id", async () => {
    await channelHttp.deleteChannel(serverId, channelId);
    expect(http.delete).toHaveBeenCalledWith(`/servers/${serverId}/channels/${channelId}`);
  });
});
