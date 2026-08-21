import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { authToken, useAuthTokenStore } from "./auth-token";

describe("auth-token store and utilities", () => {
  beforeEach(() => {
    localStorage.clear();
    useAuthTokenStore.getState().clearToken();
  });

  afterEach(() => {
    localStorage.clear();
  });

  it("initializes with a null token by default", () => {
    expect(authToken.get()).toBeNull();
    expect(useAuthTokenStore.getState().token).toBeNull();
  });

  it("sets token via authToken helper and updates store state", () => {
    const testToken = "jwt_access_token_xyz_123";

    authToken.set(testToken);

    expect(authToken.get()).toBe(testToken);
    expect(useAuthTokenStore.getState().token).toBe(testToken);
  });

  it("clears token via authToken helper", () => {
    authToken.set("sample_token");
    expect(authToken.get()).toBe("sample_token");

    authToken.clear();

    expect(authToken.get()).toBeNull();
    expect(useAuthTokenStore.getState().token).toBeNull();
  });

  it("persists token in localStorage under 'voxhold_session_token' key", () => {
    const sessionToken = "session_token_persistent_456";

    authToken.set(sessionToken);

    const storedRaw = localStorage.getItem("voxhold_session_token");
    expect(storedRaw).not.toBeNull();

    const parsed = JSON.parse(storedRaw as string);
    expect(parsed.state.token).toBe(sessionToken);
  });

  it("updates localStorage when token is cleared", () => {
    authToken.set("temporary_token");
    authToken.clear();

    const storedRaw = localStorage.getItem("voxhold_session_token");
    const parsed = JSON.parse(storedRaw as string);
    expect(parsed.state.token).toBeNull();
  });
});
