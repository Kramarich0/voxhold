import { beforeEach, describe, expect, it, vi } from "vitest";
import { http } from "@/shared/api/http-client";
import { serverHttp } from "./server.http";

vi.mock("@/shared/api/http-client", () => ({
  http: {
    get: vi.fn(),
    post: vi.fn(),
    patch: vi.fn(),
  },
}));

describe("serverHttp api client", () => {
  const serverId = 1;
  const userId = 5;

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("fetches user joined servers list", async () => {
    await serverHttp.getMyServers();
    expect(http.get).toHaveBeenCalledWith("/me/servers");
  });

  it("updates server name", async () => {
    const payload = { name: "Voxhold Community" };
    await serverHttp.updateServer(serverId, payload);
    expect(http.patch).toHaveBeenCalledWith(`/servers/${serverId}`, payload);
  });

  it("fetches server members", async () => {
    await serverHttp.getServerMembers(serverId);
    expect(http.get).toHaveBeenCalledWith(`/servers/${serverId}/members`);
  });

  it("updates member role", async () => {
    const payload = { role: "admin" as const };
    await serverHttp.updateMemberRole(serverId, userId, payload);
    expect(http.patch).toHaveBeenCalledWith(`/servers/${serverId}/members/${userId}/role`, payload);
  });

  it("bans a member from server", async () => {
    await serverHttp.banMember(serverId, userId);
    expect(http.post).toHaveBeenCalledWith(`/servers/${serverId}/bans/${userId}`);
  });
});
