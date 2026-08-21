import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { deleteClientCookie, getClientCookie, setClientCookie } from "./cookies";

describe("cookies utility", () => {
  const mockCookieStore = {
    get: vi.fn(),
    set: vi.fn(),
    delete: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
    vi.stubGlobal("cookieStore", mockCookieStore);
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    vi.useRealTimers();
  });

  describe("getClientCookie", () => {
    it("returns the cookie value when the cookie exists", async () => {
      mockCookieStore.get.mockResolvedValueOnce({ value: "session_token_123" });

      const result = await getClientCookie("auth_token");

      expect(mockCookieStore.get).toHaveBeenCalledWith("auth_token");
      expect(result).toBe("session_token_123");
    });

    it("returns null when the cookie does not exist", async () => {
      mockCookieStore.get.mockResolvedValueOnce(null);

      const result = await getClientCookie("non_existent_cookie");

      expect(mockCookieStore.get).toHaveBeenCalledWith("non_existent_cookie");
      expect(result).toBeNull();
    });

    it("catches errors, logs to console, and returns null gracefully", async () => {
      const consoleSpy = vi.spyOn(console, "error").mockImplementation(() => {});
      const error = new Error("SecurityError: Access Denied");
      mockCookieStore.get.mockRejectedValueOnce(error);

      const result = await getClientCookie("forbidden_cookie");

      expect(result).toBeNull();
      expect(consoleSpy).toHaveBeenCalledWith('Failed to read cookie "forbidden_cookie":', error);
    });
  });

  describe("setClientCookie", () => {
    it("sets a cookie with correct attributes and calculates expiration timestamp", async () => {
      vi.useFakeTimers();
      const mockNow = 1_700_000_000_000;
      vi.setSystemTime(mockNow);

      const maxAge = 60_000 * 60 * 24; // 1 day
      await setClientCookie("sidebar_state", true, maxAge);

      expect(mockCookieStore.set).toHaveBeenCalledWith({
        name: "sidebar_state",
        value: "true",
        path: "/",
        sameSite: "lax",
        expires: mockNow + maxAge,
      });
    });

    it("converts string values properly", async () => {
      await setClientCookie("theme", "dark", 10_000);

      expect(mockCookieStore.set).toHaveBeenCalledWith(
        expect.objectContaining({
          name: "theme",
          value: "dark",
          path: "/",
          sameSite: "lax",
        }),
      );
    });

    it("catches and logs errors when cookieStore.set fails", async () => {
      const consoleSpy = vi.spyOn(console, "error").mockImplementation(() => {});
      const error = new Error("QuotaExceededError");
      mockCookieStore.set.mockRejectedValueOnce(error);

      await setClientCookie("sidebar_state", false, 1000);

      expect(consoleSpy).toHaveBeenCalledWith('Failed to write cookie "sidebar_state":', error);
    });
  });

  describe("deleteClientCookie", () => {
    it("calls cookieStore.delete with the provided cookie name", async () => {
      await deleteClientCookie("auth_token");

      expect(mockCookieStore.delete).toHaveBeenCalledWith("auth_token");
    });

    it("catches and logs errors when cookieStore.delete fails", async () => {
      const consoleSpy = vi.spyOn(console, "error").mockImplementation(() => {});
      const error = new Error("Delete failed");
      mockCookieStore.delete.mockRejectedValueOnce(error);

      await deleteClientCookie("auth_token");

      expect(consoleSpy).toHaveBeenCalledWith('Failed to delete cookie "auth_token":', error);
    });
  });
});
