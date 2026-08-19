export type HttpMethod = "GET" | "POST" | "PUT" | "PATCH" | "DELETE" | "HEAD" | "OPTIONS";

export type QueryParamPrimitive = string | number | boolean | bigint;
export type QueryParamValue = QueryParamPrimitive | QueryParamPrimitive[] | null | undefined;
export type QueryParams = Record<string, QueryParamValue>;

export interface RequestOptions<TBody = unknown>
  extends Omit<RequestInit, "body" | "method" | "headers"> {
  params?: QueryParams;
  json?: TBody;
  body?: BodyInit;
  headers?: HeadersInit;
  timeoutMs?: number;
  token?: string | null;
  skipAuth?: boolean;
  _isRetry?: boolean;
}

export interface ClientConfig {
  baseUrl?: string;
  defaultTimeoutMs?: number;
  defaultHeaders?: HeadersInit;
  getAccessToken?: () => string | null | undefined | Promise<string | null | undefined>;
  refreshAccessToken?: () => Promise<string | null | undefined>;
  onUnauthorized?: () => void;
}

export interface RequestInterceptor {
  onRequest?: (config: RequestOptions) => RequestOptions | Promise<RequestOptions>;
  onResponse?: (response: Response) => Response | Promise<Response>;
  onError?: (error: unknown) => unknown | Promise<unknown>;
}

export class HttpError<TPayload = unknown> extends Error {
  readonly status: number;
  readonly statusText: string;
  readonly payload?: TPayload;
  readonly response: Response;

  constructor(response: Response, payload?: TPayload, customMessage?: string) {
    const message =
      customMessage || `HTTP Error ${response.status}: ${response.statusText || "Unknown Status"}`;
    super(message);
    this.name = "HttpError";
    this.status = response.status;
    this.statusText = response.statusText;
    this.payload = payload;
    this.response = response;
    Object.setPrototypeOf(this, new.target.prototype);
  }
}

export function isHttpError<T = unknown>(error: unknown): error is HttpError<T> {
  return error instanceof HttpError;
}

function buildUrl(endpoint: string, baseUrl?: string, params?: QueryParams): URL {
  let combinedPath = endpoint;

  if (!/^https?:\/\//i.test(endpoint)) {
    if (baseUrl != null && baseUrl !== "") {
      const normalizedBase = baseUrl.endsWith("/") ? baseUrl.slice(0, -1) : baseUrl;
      const normalizedEndpoint = endpoint.startsWith("/") ? endpoint : `/${endpoint}`;
      combinedPath = `${normalizedBase}${normalizedEndpoint}`;
    }
  }

  let url: URL;

  if (/^https?:\/\//i.test(combinedPath)) {
    url = new URL(combinedPath);
  } else if (typeof window !== "undefined" && window.location?.origin != null) {
    url = new URL(combinedPath, window.location.origin);
  } else {
    url = new URL(combinedPath, "http://localhost");
  }

  if (params != null) {
    for (const [key, value] of Object.entries(params)) {
      if (value == null || value === "") {
        continue;
      }

      if (Array.isArray(value)) {
        for (const item of value) {
          if (item != null && item !== "") {
            url.searchParams.append(key, String(item));
          }
        }
      } else {
        url.searchParams.set(key, String(value));
      }
    }
  }

  return url;
}

function createAbortManager(timeoutMs: number, externalSignal?: AbortSignal | null) {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => {
    controller.abort(
      new DOMException(`Request timeout of ${timeoutMs}ms exceeded`, "TimeoutError"),
    );
  }, timeoutMs);

  const onExternalAbort = () => {
    controller.abort(externalSignal?.reason);
  };

  if (externalSignal != null) {
    if (externalSignal.aborted) {
      controller.abort(externalSignal.reason);
    } else {
      externalSignal.addEventListener("abort", onExternalAbort, { once: true });
    }
  }

  const cleanup = () => {
    clearTimeout(timeoutId);
    if (externalSignal != null) {
      externalSignal.removeEventListener("abort", onExternalAbort);
    }
  };

  return { signal: controller.signal, cleanup };
}

function buildHeaders(
  defaultHeaders?: HeadersInit,
  customHeaders?: HeadersInit,
  hasJson?: boolean,
  isFormData?: boolean,
  token?: string | null,
): Headers {
  const headers = new Headers(defaultHeaders);

  if (customHeaders != null) {
    new Headers(customHeaders).forEach((value, key) => {
      headers.set(key, value);
    });
  }

  if (hasJson === true && !headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json");
  }

  if (isFormData === true) {
    headers.delete("Content-Type");
  }

  if (token != null && !headers.has("Authorization")) {
    headers.set("Authorization", `Bearer ${token}`);
  }

  return headers;
}

async function parseResponseBody<T>(response: Response): Promise<T> {
  if (response.status === 204 || response.status === 205) {
    return undefined as T;
  }

  const contentLength = response.headers.get("content-length");
  if (contentLength === "0") {
    return undefined as T;
  }

  const contentType = response.headers.get("content-type") ?? "";

  if (contentType.includes("application/json") || contentType.includes("+json")) {
    const rawText = await response.text();
    if (rawText == null || rawText.trim() === "") {
      return undefined as T;
    }
    return JSON.parse(rawText) as T;
  }

  if (contentType.includes("text/")) {
    return (await response.text()) as unknown as T;
  }

  return (await response.blob()) as unknown as T;
}

async function extractErrorPayload(
  response: Response,
): Promise<{ message: string; payload?: unknown }> {
  try {
    const raw = await response.text();
    if (raw == null || raw.trim() === "") {
      return { message: response.statusText || `HTTP ${response.status}` };
    }

    try {
      const data = JSON.parse(raw) as Record<string, unknown>;
      let message = "";

      if (typeof data.error === "string") {
        message = data.error;
      } else if (typeof data.message === "string") {
        message = data.message;
      } else if (Array.isArray(data.message)) {
        message = data.message.join(", ");
      } else if (typeof data.detail === "string") {
        message = data.detail;
      } else if (typeof data.title === "string") {
        message = data.title;
      }

      return {
        message: message || response.statusText || `HTTP ${response.status}`,
        payload: data,
      };
    } catch {
      return {
        message: raw.length > 256 ? `${raw.slice(0, 256)}...` : raw,
        payload: raw,
      };
    }
  } catch {
    return { message: response.statusText || `HTTP ${response.status}` };
  }
}

function createTokenRefreshCoordinator(refreshFn?: () => Promise<string | null | undefined>) {
  let activeRefreshPromise: Promise<string | null | undefined> | null = null;

  return async function coordinateRefresh(): Promise<string | null | undefined> {
    if (refreshFn == null) {
      return null;
    }

    if (activeRefreshPromise == null) {
      activeRefreshPromise = (async () => {
        try {
          return await refreshFn();
        } finally {
          activeRefreshPromise = null;
        }
      })();
    }

    return activeRefreshPromise;
  };
}

function createInterceptorPipeline() {
  const interceptors: RequestInterceptor[] = [];

  const use = (interceptor: RequestInterceptor): (() => void) => {
    interceptors.push(interceptor);
    return () => {
      const index = interceptors.indexOf(interceptor);
      if (index !== -1) {
        interceptors.splice(index, 1);
      }
    };
  };

  const applyRequest = async (config: RequestOptions): Promise<RequestOptions> => {
    let current = config;
    for (const interceptor of interceptors) {
      if (interceptor.onRequest != null) {
        current = await interceptor.onRequest(current);
      }
    }
    return current;
  };

  const applyResponse = async (response: Response): Promise<Response> => {
    let current = response;
    for (const interceptor of interceptors) {
      if (interceptor.onResponse != null) {
        current = await interceptor.onResponse(current);
      }
    }
    return current;
  };

  const applyError = async (error: unknown): Promise<unknown> => {
    let current = error;
    for (const interceptor of interceptors) {
      if (interceptor.onError != null) {
        current = await interceptor.onError(current);
      }
    }
    return current;
  };

  return { use, applyRequest, applyResponse, applyError };
}

export function createApiClient(config: ClientConfig = {}) {
  const {
    baseUrl,
    defaultTimeoutMs = 15000,
    defaultHeaders = {},
    getAccessToken,
    refreshAccessToken,
    onUnauthorized,
  } = config;

  const interceptorPipeline = createInterceptorPipeline();
  const coordinateRefresh = createTokenRefreshCoordinator(refreshAccessToken);

  async function request<TResponse, TBody = unknown>(
    endpoint: string,
    method: HttpMethod,
    options: RequestOptions<TBody> = {},
  ): Promise<TResponse> {
    const interceptedOptions = (await interceptorPipeline.applyRequest(
      options as RequestOptions,
    )) as RequestOptions<TBody>;

    const {
      params,
      json,
      body: rawBody,
      headers: customHeaders,
      timeoutMs = defaultTimeoutMs,
      token: explicitToken,
      skipAuth = false,
      _isRetry = false,
      signal: externalSignal,
      ...fetchInit
    } = interceptedOptions;

    const url = buildUrl(endpoint, baseUrl, params);
    const hasJson = json != null;
    const finalBody = hasJson ? JSON.stringify(json) : rawBody;
    const isFormData = finalBody instanceof FormData;
    const isReadableStream =
      typeof ReadableStream !== "undefined" && finalBody instanceof ReadableStream;

    let resolvedToken: string | null | undefined = explicitToken;
    if (!skipAuth && resolvedToken == null) {
      resolvedToken = await getAccessToken?.();
    }

    const headers = buildHeaders(defaultHeaders, customHeaders, hasJson, isFormData, resolvedToken);
    const { signal, cleanup } = createAbortManager(timeoutMs, externalSignal);

    const fetchOptions: RequestInit & { duplex?: "half" } = {
      ...fetchInit,
      method,
      headers,
      body: finalBody,
      signal,
      ...(isReadableStream ? { duplex: "half" } : {}),
    };

    try {
      let response = await fetch(url.toString(), fetchOptions);

      response = await interceptorPipeline.applyResponse(response);

      if (response.status === 401 && !skipAuth && !_isRetry && refreshAccessToken != null) {
        const latestStoredToken = await getAccessToken?.();

        if (
          latestStoredToken != null &&
          resolvedToken != null &&
          latestStoredToken !== resolvedToken
        ) {
          return await request<TResponse, TBody>(endpoint, method, {
            ...options,
            token: latestStoredToken,
            _isRetry: true,
          });
        }

        const refreshedToken = await coordinateRefresh();

        if (refreshedToken != null) {
          return await request<TResponse, TBody>(endpoint, method, {
            ...options,
            token: refreshedToken,
            _isRetry: true,
          });
        }

        onUnauthorized?.();
      }

      if (!response.ok) {
        const { message, payload } = await extractErrorPayload(response);
        throw new HttpError(response, payload, message);
      }

      return await parseResponseBody<TResponse>(response);
    } catch (error) {
      const processedError = await interceptorPipeline.applyError(error);
      throw processedError;
    } finally {
      cleanup();
    }
  }

  return {
    request,
    use: interceptorPipeline.use,
    get: <TResponse>(endpoint: string, options?: Omit<RequestOptions, "json" | "body">) =>
      request<TResponse>(endpoint, "GET", options),
    post: <TResponse, TBody = unknown>(
      endpoint: string,
      json?: TBody,
      options?: Omit<RequestOptions<TBody>, "json" | "body">,
    ) => request<TResponse, TBody>(endpoint, "POST", { ...options, json }),
    postForm: <TResponse>(
      endpoint: string,
      formData: FormData,
      options?: Omit<RequestOptions, "json" | "body">,
    ) => request<TResponse>(endpoint, "POST", { ...options, body: formData }),
    put: <TResponse, TBody = unknown>(
      endpoint: string,
      json?: TBody,
      options?: Omit<RequestOptions<TBody>, "json" | "body">,
    ) => request<TResponse, TBody>(endpoint, "PUT", { ...options, json }),
    patch: <TResponse, TBody = unknown>(
      endpoint: string,
      json?: TBody,
      options?: Omit<RequestOptions<TBody>, "json" | "body">,
    ) => request<TResponse, TBody>(endpoint, "PATCH", { ...options, json }),
    delete: <TResponse>(endpoint: string, options?: Omit<RequestOptions, "json" | "body">) =>
      request<TResponse>(endpoint, "DELETE", options),
    head: <TResponse>(endpoint: string, options?: Omit<RequestOptions, "json" | "body">) =>
      request<TResponse>(endpoint, "HEAD", options),
    options: <TResponse>(endpoint: string, options?: Omit<RequestOptions, "json" | "body">) =>
      request<TResponse>(endpoint, "OPTIONS", options),
  };
}

export type ApiClient = ReturnType<typeof createApiClient>;
