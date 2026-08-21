import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { authToken } from "./auth-token";
import { http } from "./http-client";
import { HttpError } from "./http-core";

describe("http client instance", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    authToken.clear();
  });

  afterEach(() => {
    vi.restoreAllMocks();
    authToken.clear();
  });

  it("automatically attaches bearer token from authToken store", async () => {
    authToken.set("my_active_session_token");

    const fetchSpy = vi.fn().mockImplementation(() =>
      Promise.resolve(
        new Response(JSON.stringify({ ok: true }), {
          status: 200,
          headers: { "Content-Type": "application/json" },
        }),
      ),
    );
    vi.stubGlobal("fetch", fetchSpy);

    await http.get("/me/profile");

    expect(fetchSpy).toHaveBeenCalledTimes(1);
    const headers = fetchSpy.mock.calls[0]![1].headers as Headers;
    expect(headers.get("Authorization")).toBe("Bearer my_active_session_token");
  });

  it("handles 401 with successful token refresh and replays original request", async () => {
    authToken.set("expired_jwt_token");

    const fetchSpy = vi.fn().mockImplementation((url: string) => {
      if (url.includes("/channels")) {
        const authHeader = (
          fetchSpy.mock.calls[fetchSpy.mock.calls.length - 1]![1]?.headers as Headers
        )?.get("Authorization");
        if (authHeader === "Bearer expired_jwt_token") {
          return Promise.resolve(
            new Response(JSON.stringify({ error: "Unauthorized" }), {
              status: 401,
              headers: { "Content-Type": "application/json" },
            }),
          );
        }
        return Promise.resolve(
          new Response(JSON.stringify([{ id: 1, name: "general" }]), {
            status: 200,
            headers: { "Content-Type": "application/json" },
          }),
        );
      }

      if (url.includes("/auth/refresh")) {
        return Promise.resolve(
          new Response(JSON.stringify({ token: "brand_new_token_999", expires_at: 1800000000 }), {
            status: 200,
            headers: { "Content-Type": "application/json" },
          }),
        );
      }

      return Promise.reject(new Error(`Unexpected url: ${url}`));
    });

    vi.stubGlobal("fetch", fetchSpy);

    const result = await http.get<{ id: number; name: string }[]>("/channels");

    expect(fetchSpy).toHaveBeenCalledTimes(3);
    expect(authToken.get()).toBe("brand_new_token_999");
    expect(result).toEqual([{ id: 1, name: "general" }]);
  });

  it("clears token when refresh endpoint returns error", async () => {
    authToken.set("revoked_token");

    const fetchSpy = vi.fn().mockImplementation((url: string) => {
      if (url.includes("/auth/refresh")) {
        return Promise.resolve(
          new Response(JSON.stringify({ error: "Refresh token expired" }), {
            status: 401,
            headers: { "Content-Type": "application/json" },
          }),
        );
      }
      return Promise.resolve(
        new Response(JSON.stringify({ error: "Unauthorized" }), {
          status: 401,
          headers: { "Content-Type": "application/json" },
        }),
      );
    });

    vi.stubGlobal("fetch", fetchSpy);

    await expect(http.get("/me/servers")).rejects.toThrow(HttpError);
    expect(authToken.get()).toBeNull();
  });

  it("does not call /auth/refresh if there was no token initially", async () => {
    authToken.clear();

    const fetchSpy = vi.fn().mockImplementation(() =>
      Promise.resolve(
        new Response(JSON.stringify({ error: "Unauthorized" }), {
          status: 401,
          headers: { "Content-Type": "application/json" },
        }),
      ),
    );
    vi.stubGlobal("fetch", fetchSpy);

    await expect(http.get("/secret")).rejects.toThrow(HttpError);

    expect(fetchSpy).toHaveBeenCalledTimes(1);
    expect(authToken.get()).toBeNull();
  });

  it("handles network crash during token refresh gracefully", async () => {
    authToken.set("some_token");

    const fetchSpy = vi.fn().mockImplementation((url: string) => {
      if (url.includes("/auth/refresh")) {
        return Promise.reject(new TypeError("Network connection lost"));
      }
      return Promise.resolve(
        new Response(JSON.stringify({ error: "Unauthorized" }), {
          status: 401,
          headers: { "Content-Type": "application/json" },
        }),
      );
    });

    vi.stubGlobal("fetch", fetchSpy);

    await expect(http.get("/data")).rejects.toThrow(HttpError);
    expect(authToken.get()).toBeNull();
  });
});
