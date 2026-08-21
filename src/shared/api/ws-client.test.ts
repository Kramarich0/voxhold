import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { authToken } from "./auth-token";
import { createWsClient } from "./ws-client";

class MockWebSocket {
  static instances: MockWebSocket[] = [];
  static readonly CONNECTING = 0;
  static readonly OPEN = 1;
  static readonly CLOSING = 2;
  static readonly CLOSED = 3;

  readonly CONNECTING = 0;
  readonly OPEN = 1;
  readonly CLOSING = 2;
  readonly CLOSED = 3;

  url: string;
  readyState = MockWebSocket.CONNECTING;
  sentMessages: string[] = [];

  onopen: ((ev: Event) => void) | null = null;
  onclose: ((ev: CloseEvent) => void) | null = null;
  onerror: ((ev: Event) => void) | null = null;
  onmessage: ((ev: MessageEvent) => void) | null = null;

  constructor(url: string) {
    this.url = url;
    MockWebSocket.instances.push(this);
  }

  send(data: string) {
    this.sentMessages.push(data);
  }

  close(code = 1000, reason = "Closed") {
    this.readyState = MockWebSocket.CLOSED;
    this.onclose?.(new CloseEvent("close", { code, reason }));
  }

  simulateOpen() {
    this.readyState = MockWebSocket.OPEN;
    this.onopen?.(new Event("open"));
  }

  simulateMessage(data: unknown) {
    const raw = typeof data === "string" ? data : JSON.stringify(data);
    this.onmessage?.(new MessageEvent("message", { data: raw }));
  }
}

describe("ws-client instance & factory", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.useFakeTimers();
    MockWebSocket.instances = [];
    vi.stubGlobal("WebSocket", MockWebSocket);
    authToken.clear();
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.restoreAllMocks();
    authToken.clear();
  });

  describe("Endpoint Resolution", () => {
    it("uses explicit baseUrl when provided to factory", async () => {
      const client = createWsClient("wss://custom-domain.com/socket");
      await client.connect();

      const ws = MockWebSocket.instances[0]!;
      expect(ws.url).toBe("wss://custom-domain.com/socket");
    });

    it("resolves default endpoint using window.location", async () => {
      const client = createWsClient();
      await client.connect();

      const ws = MockWebSocket.instances[0]!;
      expect(ws.url).toMatch(/^wss?:\/\/.*\/api\/v1\/ws$/);
    });
  });

  describe("Authentication Handshake onOpen", () => {
    it("sends auth token packet upon connection open when token is present", async () => {
      authToken.set("my_secret_token_123");

      const client = createWsClient("wss://test.com");
      await client.connect();

      const ws = MockWebSocket.instances[0]!;
      ws.simulateOpen();
      await Promise.resolve();

      expect(ws.sentMessages).toHaveLength(1);
      expect(JSON.parse(ws.sentMessages[0]!)).toEqual({
        type: "auth",
        data: { token: "my_secret_token_123" },
      });
    });

    it("closes connection with 4001 code when no token is available", async () => {
      authToken.clear();

      const client = createWsClient("wss://test.com");
      await client.connect();

      const ws = MockWebSocket.instances[0]!;
      const closeSpy = vi.spyOn(ws, "close");

      ws.simulateOpen();
      await Promise.resolve();

      expect(closeSpy).toHaveBeenCalledWith(4001, "No auth token available");
      expect(ws.sentMessages).toHaveLength(0);
    });
  });

  describe("Channel Subscriptions & Resubscribe on Ready", () => {
    it("sends channel.subscribe and channel.unsubscribe events", async () => {
      authToken.set("valid_token");
      const client = createWsClient("wss://test.com");
      await client.connect();

      const ws = MockWebSocket.instances[0]!;
      ws.simulateOpen();
      await Promise.resolve();

      client.subscribeChannel(1, 10);
      expect(JSON.parse(ws.sentMessages[1]!)).toEqual({
        type: "channel.subscribe",
        data: { server_id: 1, channel_id: 10 },
      });

      client.unsubscribeChannel(1, 10);
      expect(JSON.parse(ws.sentMessages[2]!)).toEqual({
        type: "channel.unsubscribe",
        data: { server_id: 1, channel_id: 10 },
      });
    });

    it("automatically resubscribes to all active channels when server sends 'ready' event", async () => {
      authToken.set("valid_token");
      const client = createWsClient("wss://test.com");
      await client.connect();

      const ws = MockWebSocket.instances[0]!;
      ws.simulateOpen();
      await Promise.resolve();

      client.subscribeChannel(1, 10);
      client.subscribeChannel(1, 20);
      client.subscribeChannel(2, 30);
      client.unsubscribeChannel(1, 20);

      ws.sentMessages = [];

      ws.simulateMessage({
        type: "ready",
        data: { user_id: 1, protocol_version: 1 },
      });

      expect(ws.sentMessages).toHaveLength(2);
      const subscriptions = ws.sentMessages.map((msg) => JSON.parse(msg));

      expect(subscriptions).toContainEqual({
        type: "channel.subscribe",
        data: { server_id: 1, channel_id: 10 },
      });
      expect(subscriptions).toContainEqual({
        type: "channel.subscribe",
        data: { server_id: 2, channel_id: 30 },
      });
    });
  });

  describe("Error & Session Invalidation", () => {
    it("clears auth token and disconnects when server sends unauthorized error", async () => {
      const consoleSpy = vi.spyOn(console, "warn").mockImplementation(() => {});
      authToken.set("expired_token");

      const client = createWsClient("wss://test.com");
      await client.connect();

      const ws = MockWebSocket.instances[0]!;
      ws.simulateOpen();
      await Promise.resolve();

      ws.simulateMessage({
        type: "error",
        data: { code: "unauthorized", message: "Session expired" },
      });

      expect(authToken.get()).toBeNull();
      expect(client.getStatus()).toBe("disconnected");
      expect(consoleSpy).toHaveBeenCalled();
    });
  });

  describe("Logout", () => {
    it("clears all active subscriptions and disconnects cleanly", async () => {
      authToken.set("token");
      const client = createWsClient("wss://test.com");
      await client.connect();

      const ws = MockWebSocket.instances[0]!;
      ws.simulateOpen();
      await Promise.resolve();

      client.subscribeChannel(1, 10);
      client.logout();

      expect(client.getStatus()).toBe("disconnected");

      ws.sentMessages = [];
      ws.simulateMessage({
        type: "ready",
        data: { user_id: 1, protocol_version: 1 },
      });

      expect(ws.sentMessages).toHaveLength(0);
    });
  });
});
