import { beforeEach, describe, expect, it, vi } from "vitest";
import { http } from "@/shared/api/http-client";
import { userHttp } from "./user.http";

vi.mock("@/shared/api/http-client", () => ({
  http: {
    get: vi.fn(),
    patch: vi.fn(),
  },
}));

describe("userHttp api client", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("fetches current user profile", async () => {
    await userHttp.getMeProfile();
    expect(http.get).toHaveBeenCalledWith("/me/profile");
  });

  it("updates current user profile", async () => {
    const payload = { about: "Frontend developer", country_code: "AM" };
    await userHttp.updateMeProfile(payload);
    expect(http.patch).toHaveBeenCalledWith("/me/profile", payload);
  });

  it("fetches other user profile by id", async () => {
    const targetUserId = 42;
    await userHttp.getUserProfile(targetUserId);
    expect(http.get).toHaveBeenCalledWith(`/users/${targetUserId}/profile`);
  });
});
