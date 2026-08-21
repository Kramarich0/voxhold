export type WsConnectionStatus =
  | "idle"
  | "connecting"
  | "connected"
  | "reconnecting"
  | "disconnected";

export interface WsEvent<TType extends string = string, TData = unknown> {
  request_id?: string;
  type: TType;
  data?: TData;
}

export interface WsErrorPayload {
  code: string;
  message: string;
}

export class WsError extends Error {
  readonly code: string;
  readonly originalEvent?: Event | CloseEvent;

  constructor(message: string, code = "WS_ERROR", originalEvent?: Event | CloseEvent) {
    super(message);
    this.name = "WsError";
    this.code = code;
    this.originalEvent = originalEvent;
    Object.setPrototypeOf(this, new.target.prototype);
  }
}

export interface WsCoreConfig {
  url: string | (() => string | Promise<string>);
  reconnect?: {
    enabled?: boolean;
    initialDelayMs?: number;
    maxDelayMs?: number;
    backoffMultiplier?: number;
    maxAttempts?: number;
  };
  queue?: {
    maxSize?: number;
  };
  onStatusChange?: (status: WsConnectionStatus) => void;
  onError?: (error: WsError) => void;
  onOpen?: (socket: WebSocket) => void | Promise<void>;
  onClose?: (event: CloseEvent) => void;
}

export type WsEventListener<TData = unknown> = (
  data: TData,
  rawEvent: WsEvent<string, TData>,
) => void;

export type WsStatusListener = (status: WsConnectionStatus) => void;

export function createWsCore<
  TIncomingMap extends Record<string, unknown> = Record<string, unknown>,
  TOutgoingMap extends Record<string, unknown> = Record<string, unknown>,
>(config: WsCoreConfig) {
  const {
    url,
    reconnect: reconnectConfig = {},
    queue: queueConfig = {},
    onStatusChange,
    onError,
    onOpen,
    onClose,
  } = config;

  const {
    enabled: isReconnectEnabled = true,
    initialDelayMs = 1000,
    maxDelayMs = 15000,
    backoffMultiplier = 1.5,
    maxAttempts = 15,
  } = reconnectConfig;

  const { maxSize: maxQueueSize = 100 } = queueConfig;

  let socket: WebSocket | null = null;
  let status: WsConnectionStatus = "idle";
  let reconnectAttempts = 0;
  let reconnectTimer: ReturnType<typeof setTimeout> | null = null;
  let isExplicitlyClosed = false;

  const outgoingQueue: string[] = [];
  const eventListeners = new Map<string, Set<WsEventListener>>();
  const statusListeners = new Set<WsStatusListener>();

  function setStatus(nextStatus: WsConnectionStatus) {
    if (status === nextStatus) return;
    status = nextStatus;
    onStatusChange?.(nextStatus);
    statusListeners.forEach((listener) => {
      try {
        listener(nextStatus);
      } catch (err) {
        console.error("[WS Core] Status listener error:", err);
      }
    });
  }

  async function resolveUrl(): Promise<string> {
    if (typeof url === "function") {
      return await url();
    }
    return url;
  }

  function clearReconnectTimer() {
    if (reconnectTimer != null) {
      clearTimeout(reconnectTimer);
      reconnectTimer = null;
    }
  }

  function scheduleReconnect() {
    if (!isReconnectEnabled || isExplicitlyClosed || reconnectTimer != null) {
      return;
    }

    if (reconnectAttempts >= maxAttempts) {
      setStatus("disconnected");
      onError?.(
        new WsError(`Max reconnect attempts reached (${maxAttempts})`, "MAX_RECONNECT_EXCEEDED"),
      );
      return;
    }

    reconnectAttempts++;
    setStatus("reconnecting");

    const baseDelay = initialDelayMs * backoffMultiplier ** (reconnectAttempts - 1);
    const delayWithJitter = Math.min(baseDelay, maxDelayMs) + Math.random() * 500;

    reconnectTimer = setTimeout(() => {
      reconnectTimer = null;
      void connect();
    }, delayWithJitter);
  }

  function flushQueue() {
    if (socket == null || socket.readyState !== WebSocket.OPEN) return;

    while (outgoingQueue.length > 0) {
      const message = outgoingQueue.shift();
      if (message) {
        socket.send(message);
      }
    }
  }

  async function connect(): Promise<void> {
    if (typeof window === "undefined") return;

    if (
      socket &&
      (socket.readyState === WebSocket.OPEN || socket.readyState === WebSocket.CONNECTING)
    ) {
      return;
    }

    clearReconnectTimer();
    isExplicitlyClosed = false;
    setStatus(reconnectAttempts > 0 ? "reconnecting" : "connecting");

    try {
      const targetUrl = await resolveUrl();
      socket = new WebSocket(targetUrl);

      socket.onopen = async () => {
        reconnectAttempts = 0;
        setStatus("connected");

        try {
          if (socket != null) await onOpen?.(socket);
        } catch (err) {
          console.error("[WS Core] onOpen hook error:", err);
        }

        flushQueue();
      };

      socket.onmessage = (messageEvent: MessageEvent) => {
        try {
          const parsed = JSON.parse(messageEvent.data as string) as WsEvent;
          emit(parsed.type, parsed.data, parsed);
        } catch (err) {
          console.error("[WS Core] Failed to parse message:", messageEvent.data, err);
        }
      };

      socket.onclose = (closeEvent: CloseEvent) => {
        onClose?.(closeEvent);

        if (!isExplicitlyClosed) {
          scheduleReconnect();
        } else {
          setStatus("disconnected");
        }
      };

      socket.onerror = (domEvent: Event) => {
        const error = new WsError("WebSocket connection error", "CONNECTION_ERROR", domEvent);
        onError?.(error);
      };
    } catch (err) {
      const error =
        err instanceof WsError
          ? err
          : new WsError("Failed to initiate WebSocket connection", "INIT_FAILED");
      onError?.(error);
      scheduleReconnect();
    }
  }

  function disconnect(code = 1000, reason = "Client disconnected"): void {
    isExplicitlyClosed = true;
    clearReconnectTimer();
    reconnectAttempts = 0;

    if (socket) {
      socket.close(code, reason);
      socket = null;
    }

    setStatus("disconnected");
  }

  function send<TKey extends Extract<keyof TOutgoingMap, string>>(
    type: TKey,
    data?: TOutgoingMap[TKey],
    requestId?: string,
  ): boolean {
    const payload: WsEvent<TKey, TOutgoingMap[TKey]> = {
      type,
      ...(data !== undefined ? { data } : {}),
      ...(requestId ? { request_id: requestId } : {}),
    };

    const raw = JSON.stringify(payload);

    if (socket && socket.readyState === WebSocket.OPEN) {
      socket.send(raw);
      return true;
    }

    if (outgoingQueue.length >= maxQueueSize) {
      outgoingQueue.shift();
    }

    outgoingQueue.push(raw);
    return false;
  }

  function emit(type: string, data: unknown, rawEvent: WsEvent): void {
    const listeners = eventListeners.get(type);
    if (!listeners || listeners.size === 0) return;

    listeners.forEach((listener) => {
      try {
        listener(data, rawEvent);
      } catch (err) {
        console.error(`[WS Core] Error in event listener for "${type}":`, err);
      }
    });
  }

  function on<TKey extends Extract<keyof TIncomingMap, string>>(
    type: TKey,
    listener: WsEventListener<TIncomingMap[TKey]>,
  ): () => void {
    let listeners = eventListeners.get(type);

    if (!listeners) {
      listeners = new Set();
      eventListeners.set(type, listeners);
    }

    listeners.add(listener as WsEventListener<unknown>);

    return () => {
      listeners.delete(listener as WsEventListener<unknown>);
      if (listeners.size === 0) {
        eventListeners.delete(type);
      }
    };
  }

  function onStatus(listener: WsStatusListener): () => void {
    statusListeners.add(listener);
    listener(status);
    return () => {
      statusListeners.delete(listener);
    };
  }

  return {
    connect,
    disconnect,
    send,
    on,
    onStatus,
    getStatus: () => status,
    getSocket: () => socket,
  };
}

export type WsCoreInstance<
  TIncomingMap extends Record<string, unknown> = Record<string, unknown>,
  TOutgoingMap extends Record<string, unknown> = Record<string, unknown>,
> = ReturnType<typeof createWsCore<TIncomingMap, TOutgoingMap>>;
