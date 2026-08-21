import { beforeEach, describe, expect, it, vi } from "vitest";
import { http } from "@/shared/api/http-client";
import { authHttp } from "./auth.http";

vi.mock("@/shared/api/http-client", () => ({
  http: {
    get: vi.fn(),
    post: vi.fn(),
    delete: vi.fn(),
  },
}));

describe("authHttp api client", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("calls getInstance with skipAuth: true", async () => {
    await authHttp.getInstance();
    expect(http.get).toHaveBeenCalledWith("/instance", { skipAuth: true });
  });

  it("calls login with payload and skipAuth: true", async () => {
    const payload = { username: "karen", password: "password123" };
    await authHttp.login(payload);
    expect(http.post).toHaveBeenCalledWith("/auth/login", payload, { skipAuth: true });
  });

  it("calls register with payload and skipAuth: true", async () => {
    const payload = {
      username: "karen",
      password: "password123",
      password_confirm: "password123",
      invite_token: "token_123",
    };
    await authHttp.register(payload);
    expect(http.post).toHaveBeenCalledWith("/auth/register", payload, { skipAuth: true });
  });

  it("calls refresh endpoint", async () => {
    await authHttp.refresh();
    expect(http.post).toHaveBeenCalledWith("/auth/refresh");
  });

  it("calls logout endpoint", async () => {
    await authHttp.logout();
    expect(http.post).toHaveBeenCalledWith("/auth/logout");
  });

  it("calls deleteAccount endpoint", async () => {
    await authHttp.deleteAccount();
    expect(http.delete).toHaveBeenCalledWith("/account");
  });
});
