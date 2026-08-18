type HttpMethod = "GET" | "POST" | "PUT" | "PATCH" | "DELETE";

type QueryParamValue = string | number | boolean | null | undefined;
type QueryParams = Record<string, QueryParamValue | QueryParamValue[]>;

export type RequestConfig = Omit<RequestInit, "body" | "method"> & {
  params?: QueryParams;
  json?: unknown;
  formData?: FormData;
  token?: string | null;
  timeoutMs?: number;
};

export type ApiClientOptions = {
  baseUrl?: string;
  defaultTimeoutMs?: number;
  getToken?: () => string | null | undefined;
  refreshToken?: () => Promise<string | null>;
  onUnauthorized?: () => void;
};

export class ApiError<TData = unknown> extends Error {
  readonly status: number;
  readonly statusText: string;
  readonly error: string;
  readonly data?: TData;

  constructor(status: number, statusText: string, error: string, data?: TData) {
    super(error || statusText || `HTTP Error ${status}`);
    this.name = "ApiError";
    this.status = status;
    this.statusText = statusText;
    this.error = error;
    this.data = data;
    Object.setPrototypeOf(this, new.target.prototype);
  }

  static isApiError(value: unknown): value is ApiError {
    return value instanceof ApiError;
  }
}

function buildUrl(baseUrl: string, endpoint: string, params?: QueryParams): string {
  const cleanBase = baseUrl.replace(/\/+$/, "");
  const cleanEndpoint = endpoint.startsWith("/") ? endpoint : `/${endpoint}`;
  const fullPath = `${cleanBase}${cleanEndpoint}`;

  const isAbsolute = fullPath.startsWith("http://") || fullPath.startsWith("https://");
  const origin = typeof window !== "undefined" ? window.location.origin : "http://localhost:3000";
  const url = isAbsolute ? new URL(fullPath) : new URL(fullPath, origin);

  if (params != null) {
    for (const [key, value] of Object.entries(params)) {
      if (value == null || value === "") continue;

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

  return isAbsolute ? url.toString() : `${url.pathname}${url.search}`;
}

function buildHeaders(
  customHeaders?: HeadersInit,
  token?: string | null,
  isJson?: boolean,
  isFormData?: boolean,
): Headers {
  const headers = new Headers(customHeaders);

  if (isJson === true && !headers.has("Content-Type")) {
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

async function parseResponse<T>(response: Response): Promise<T> {
  if (response.status === 204) {
    return undefined as T;
  }

  const contentType = response.headers.get("content-type");
  if (contentType?.includes("application/json")) {
    return (await response.json()) as T;
  }

  return (await response.text()) as unknown as T;
}

async function extractErrorPayload(
  response: Response,
): Promise<{ message: string; data?: unknown }> {
  try {
    const rawText = await response.text();
    if (!rawText.trim()) {
      return { message: "", data: undefined };
    }

    try {
      const data = JSON.parse(rawText);
      if (data != null && typeof data === "object") {
        const errorMsg =
          "error" in data && typeof (data as { error: unknown }).error === "string"
            ? (data as { error: string }).error
            : "";
        return { message: errorMsg, data };
      }
    } catch {
      if (rawText.length < 200) {
        return { message: rawText.trim(), data: undefined };
      }
    }
  } catch {}

  return { message: "", data: undefined };
}

export function createApiClient(options: ApiClientOptions = {}) {
  const baseUrl = options.baseUrl ?? import.meta.env.VITE_API_URL ?? "/api/v1";
  const defaultTimeoutMs = options.defaultTimeoutMs ?? 15000;

  let refreshPromise: Promise<string | null> | null = null;

  async function request<T>(
    endpoint: string,
    method: HttpMethod,
    config: RequestConfig = {},
  ): Promise<T> {
    const {
      params,
      json,
      formData,
      token: overrideToken,
      headers: rawHeaders,
      timeoutMs = defaultTimeoutMs,
      signal: customSignal,
      ...rest
    } = config;

    const token = overrideToken != null ? overrideToken : (options.getToken?.() ?? null);
    const hasJson = json != null;
    const hasFormData = formData != null;

    const url = buildUrl(baseUrl, endpoint, params);
    const headers = buildHeaders(rawHeaders, token, hasJson, hasFormData);

    let body: BodyInit | undefined;
    if (hasJson) {
      body = JSON.stringify(json);
    } else if (hasFormData) {
      body = formData;
    }

    const controller = new AbortController();
    const timeoutId = setTimeout(
      () => controller.abort(new Error(`Timeout after ${timeoutMs}ms`)),
      timeoutMs,
    );

    if (customSignal != null) {
      customSignal.addEventListener("abort", () => controller.abort(customSignal.reason));
    }

    try {
      const response = await fetch(url, {
        ...rest,
        method,
        headers,
        body,
        signal: controller.signal,
      });

      if (response.status === 401) {
        const isAuthRoute =
          endpoint.includes("/auth/login") ||
          endpoint.includes("/auth/register") ||
          endpoint.includes("/auth/refresh");

        if (!isAuthRoute && options.refreshToken != null) {
          if (refreshPromise == null) {
            refreshPromise = options.refreshToken().finally(() => {
              refreshPromise = null;
            });
          }

          const newToken = await refreshPromise;

          if (newToken != null) {
            return await request<T>(endpoint, method, {
              ...config,
              token: newToken,
            });
          }
        }

        options.onUnauthorized?.();
      }

      if (!response.ok) {
        const { message, data } = await extractErrorPayload(response);
        throw new ApiError(response.status, response.statusText, message, data);
      }

      return await parseResponse<T>(response);
    } finally {
      clearTimeout(timeoutId);
    }
  }

  return {
    get: <T>(endpoint: string, config?: Omit<RequestConfig, "json" | "formData">) =>
      request<T>(endpoint, "GET", config),

    post: <T, D = unknown>(endpoint: string, json?: D, config?: Omit<RequestConfig, "json">) =>
      request<T>(endpoint, "POST", { ...config, json }),

    postForm: <T>(
      endpoint: string,
      formData: FormData,
      config?: Omit<RequestConfig, "formData" | "json">,
    ) => request<T>(endpoint, "POST", { ...config, formData }),

    put: <T, D = unknown>(endpoint: string, json?: D, config?: Omit<RequestConfig, "json">) =>
      request<T>(endpoint, "PUT", { ...config, json }),

    patch: <T, D = unknown>(endpoint: string, json?: D, config?: Omit<RequestConfig, "json">) =>
      request<T>(endpoint, "PATCH", { ...config, json }),

    delete: <T>(endpoint: string, config?: Omit<RequestConfig, "json" | "formData">) =>
      request<T>(endpoint, "DELETE", config),

    raw: request,
  };
}

let activeTokenGetter: (() => string | null | undefined) | null = null;
let activeUnauthorizedHandler: (() => void) | null = null;

export function configureApiAuth(
  getToken: () => string | null | undefined,
  onUnauthorized?: () => void,
) {
  activeTokenGetter = getToken;
  activeUnauthorizedHandler = onUnauthorized ?? null;
}

export const api = createApiClient({
  getToken: () => activeTokenGetter?.(),
  onUnauthorized: () => activeUnauthorizedHandler?.(),
});
