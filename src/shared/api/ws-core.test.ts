import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { createWsCore, WsError } from "./ws-core";

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

  simulateClose(code = 1006, reason = "Abnormal Closure") {
    this.readyState = MockWebSocket.CLOSED;
    this.onclose?.(new CloseEvent("close", { code, reason }));
  }

  simulateError(event = new Event("error")) {
    this.onerror?.(event);
  }
}

type TestIncoming = {
  "chat.message": { id: number; text: string };
  "user.typing": { userId: number };
};

type TestOutgoing = {
  "chat.send": { text: string };
  auth: { token: string };
};

describe("ws-core engine", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.useFakeTimers();
    MockWebSocket.instances = [];
    vi.stubGlobal("WebSocket", MockWebSocket);
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.restoreAllMocks();
  });

  describe("WsError", () => {
    it("creates custom WsError with code and original event", () => {
      const domEvent = new Event("error");
      const err = new WsError("Connection dropped", "ERR_CONN", domEvent);

      expect(err).toBeInstanceOf(Error);
      expect(err).toBeInstanceOf(WsError);
      expect(err.name).toBe("WsError");
      expect(err.message).toBe("Connection dropped");
      expect(err.code).toBe("ERR_CONN");
      expect(err.originalEvent).toBe(domEvent);
    });
  });

  describe("Connection Lifecycle and Status", () => {
    it("transitions from idle -> connecting -> connected when socket opens", async () => {
      const statusChanges: string[] = [];
      const core = createWsCore<TestIncoming, TestOutgoing>({
        url: "wss://api.voxhold.com/ws",
        onStatusChange: (status) => statusChanges.push(status),
      });

      expect(core.getStatus()).toBe("idle");

      await core.connect();
      expect(core.getStatus()).toBe("connecting");

      const ws = MockWebSocket.instances[0]!;
      ws.simulateOpen();
      await Promise.resolve();

      expect(core.getStatus()).toBe("connected");
      expect(statusChanges).toEqual(["connecting", "connected"]);
    });

    it("resolves dynamic async URL function", async () => {
      const core = createWsCore({
        url: async () => "wss://resolved-endpoint.com/ws",
      });

      await core.connect();
      const ws = MockWebSocket.instances[0]!;
      expect(ws.url).toBe("wss://resolved-endpoint.com/ws");
    });

    it("invokes onOpen hook when socket connection is established", async () => {
      const onOpenMock = vi.fn();
      const core = createWsCore({
        url: "wss://api.voxhold.com/ws",
        onOpen: onOpenMock,
      });

      await core.connect();
      const ws = MockWebSocket.instances[0]!;
      ws.simulateOpen();
      await Promise.resolve();

      expect(onOpenMock).toHaveBeenCalledWith(ws);
    });

    it("notifies listeners registered with onStatus", async () => {
      const statusListener = vi.fn();
      const core = createWsCore({ url: "wss://api.voxhold.com/ws" });

      const unsubscribe = core.onStatus(statusListener);
      expect(statusListener).toHaveBeenCalledWith("idle");

      await core.connect();
      expect(statusListener).toHaveBeenCalledWith("connecting");

      unsubscribe();

      const ws = MockWebSocket.instances[0]!;
      ws.simulateOpen();
      await Promise.resolve();

      expect(statusListener).not.toHaveBeenCalledWith("connected");
    });
  });

  describe("Message Queueing & Sending", () => {
    it("sends payload immediately if socket is open and returns true", async () => {
      const core = createWsCore<TestIncoming, TestOutgoing>({ url: "wss://test.com" });
      await core.connect();

      const ws = MockWebSocket.instances[0]!;
      ws.simulateOpen();
      await Promise.resolve();

      const sent = core.send("chat.send", { text: "Hello world" }, "req_123");
      expect(sent).toBe(true);

      expect(ws.sentMessages).toHaveLength(1);
      expect(JSON.parse(ws.sentMessages[0]!)).toEqual({
        type: "chat.send",
        data: { text: "Hello world" },
        request_id: "req_123",
      });
    });

    it("queues messages when disconnected and automatically flushes on open", async () => {
      const core = createWsCore<TestIncoming, TestOutgoing>({ url: "wss://test.com" });

      const sent1 = core.send("auth", { token: "secret_token" });
      const sent2 = core.send("chat.send", { text: "Queued message" });

      expect(sent1).toBe(false);
      expect(sent2).toBe(false);

      await core.connect();
      const ws = MockWebSocket.instances[0]!;
      expect(ws.sentMessages).toHaveLength(0);

      ws.simulateOpen();
      await Promise.resolve();

      expect(ws.sentMessages).toHaveLength(2);
      expect(JSON.parse(ws.sentMessages[0]!)).toEqual({
        type: "auth",
        data: { token: "secret_token" },
      });
      expect(JSON.parse(ws.sentMessages[1]!)).toEqual({
        type: "chat.send",
        data: { text: "Queued message" },
      });
    });

    it("drops oldest messages when queue exceeds maxSize limit", async () => {
      const core = createWsCore<TestIncoming, TestOutgoing>({
        url: "wss://test.com",
        queue: { maxSize: 2 },
      });

      core.send("chat.send", { text: "1" });
      core.send("chat.send", { text: "2" });
      core.send("chat.send", { text: "3" });

      await core.connect();
      const ws = MockWebSocket.instances[0]!;

      ws.simulateOpen();
      await Promise.resolve();

      expect(ws.sentMessages).toHaveLength(2);
      expect(JSON.parse(ws.sentMessages[0]!).data.text).toBe("2");
      expect(JSON.parse(ws.sentMessages[1]!).data.text).toBe("3");
    });
  });

  describe("Event Bus (on / emit)", () => {
    it("dispatches received events to registered listeners", async () => {
      const messageListener = vi.fn();
      const core = createWsCore<TestIncoming, TestOutgoing>({ url: "wss://test.com" });

      core.on("chat.message", messageListener);

      await core.connect();
      const ws = MockWebSocket.instances[0]!;
      ws.simulateOpen();
      await Promise.resolve();

      const incomingPayload = {
        type: "chat.message",
        data: { id: 1, text: "New message incoming!" },
      };
      ws.simulateMessage(incomingPayload);

      expect(messageListener).toHaveBeenCalledWith(incomingPayload.data, incomingPayload);
    });

    it("unsubscribes listener when callback returned by on() is called", async () => {
      const messageListener = vi.fn();
      const core = createWsCore<TestIncoming, TestOutgoing>({ url: "wss://test.com" });

      const unsubscribe = core.on("chat.message", messageListener);

      await core.connect();
      const ws = MockWebSocket.instances[0]!;
      ws.simulateOpen();
      await Promise.resolve();

      ws.simulateMessage({ type: "chat.message", data: { id: 1, text: "First" } });
      expect(messageListener).toHaveBeenCalledTimes(1);

      unsubscribe();

      ws.simulateMessage({ type: "chat.message", data: { id: 2, text: "Second" } });
      expect(messageListener).toHaveBeenCalledTimes(1);
    });

    it("handles malformed JSON without crashing", async () => {
      const consoleSpy = vi.spyOn(console, "error").mockImplementation(() => {});

      const core = createWsCore({ url: "wss://test.com" });
      await core.connect();

      const ws = MockWebSocket.instances[0]!;
      ws.simulateOpen();
      await Promise.resolve();

      expect(() => {
        ws.simulateMessage("invalid {json broken");
      }).not.toThrow();

      expect(consoleSpy).toHaveBeenCalled();
    });
  });

  describe("Reconnection & Disconnection", () => {
    it("schedules reconnection with backoff timer on unexpected disconnect", async () => {
      const core = createWsCore({
        url: "wss://test.com",
        reconnect: { initialDelayMs: 1000, backoffMultiplier: 2 },
      });

      await core.connect();
      const ws1 = MockWebSocket.instances[0]!;
      ws1.simulateOpen();
      await Promise.resolve();

      ws1.simulateClose(1006, "Network lost");

      expect(core.getStatus()).toBe("reconnecting");

      await vi.advanceTimersByTimeAsync(2000);

      expect(MockWebSocket.instances).toHaveLength(2);
    });

    it("stops reconnecting and triggers error when maxAttempts is reached", async () => {
      const onErrorMock = vi.fn();
      const core = createWsCore({
        url: "wss://test.com",
        reconnect: {
          maxAttempts: 2,
          initialDelayMs: 100,
        },
        onError: onErrorMock,
      });

      await core.connect();
      const ws1 = MockWebSocket.instances[0]!;
      ws1.simulateClose();

      await vi.advanceTimersByTimeAsync(1000);
      const ws2 = MockWebSocket.instances[1]!;
      ws2.simulateClose();

      await vi.advanceTimersByTimeAsync(1000);
      const ws3 = MockWebSocket.instances[2]!;
      ws3.simulateClose();

      expect(core.getStatus()).toBe("disconnected");
      expect(onErrorMock).toHaveBeenCalledWith(
        expect.objectContaining({
          code: "MAX_RECONNECT_EXCEEDED",
        }),
      );
    });

    it("does not reconnect on explicit disconnect() call", async () => {
      const core = createWsCore({ url: "wss://test.com" });

      await core.connect();
      const ws = MockWebSocket.instances[0]!;
      ws.simulateOpen();
      await Promise.resolve();

      core.disconnect(1000, "User logged out");

      expect(core.getStatus()).toBe("disconnected");

      await vi.advanceTimersByTimeAsync(10000);
      expect(MockWebSocket.instances).toHaveLength(1);
    });
  });
});
