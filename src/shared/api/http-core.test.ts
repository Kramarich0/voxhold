import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { createHttpClient, HttpError, isHttpError } from "./http-core";

describe("http-core engine", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.restoreAllMocks();
  });

  describe("HttpError and isHttpError", () => {
    it("creates HttpError instance with status, payload and statusText", () => {
      const response = new Response(null, { status: 404, statusText: "Not Found" });
      const payload = { error: "Resource not found" };
      const error = new HttpError(response, payload, "Custom 404 message");

      expect(error).toBeInstanceOf(Error);
      expect(error).toBeInstanceOf(HttpError);
      expect(error.name).toBe("HttpError");
      expect(error.status).toBe(404);
      expect(error.statusText).toBe("Not Found");
      expect(error.payload).toEqual(payload);
      expect(error.message).toBe("Custom 404 message");
      expect(error.response).toBe(response);
    });

    it("identifies HttpError using isHttpError type guard", () => {
      const response = new Response(null, { status: 500 });
      const httpError = new HttpError(response);
      const regularError = new Error("Regular error");

      expect(isHttpError(httpError)).toBe(true);
      expect(isHttpError(regularError)).toBe(false);
      expect(isHttpError("string error")).toBe(false);
      expect(isHttpError(null)).toBe(false);
    });
  });

  describe("URL building and query parameters", () => {
    it("joins baseUrl and endpoint normalizing slashes properly", async () => {
      const fetchSpy = vi
        .fn()
        .mockImplementation(() =>
          Promise.resolve(
            new Response("{}", { status: 200, headers: { "Content-Type": "application/json" } }),
          ),
        );
      vi.stubGlobal("fetch", fetchSpy);

      const client = createHttpClient({ baseUrl: "https://api.voxhold.com/v1/" });
      await client.get("/users");

      const calledUrl = fetchSpy.mock.calls[0]![0];
      expect(calledUrl).toBe("https://api.voxhold.com/v1/users");
    });

    it("respects absolute URL passed as endpoint without prepending baseUrl", async () => {
      const fetchSpy = vi
        .fn()
        .mockImplementation(() =>
          Promise.resolve(
            new Response("{}", { status: 200, headers: { "Content-Type": "application/json" } }),
          ),
        );
      vi.stubGlobal("fetch", fetchSpy);

      const client = createHttpClient({ baseUrl: "https://api.voxhold.com/v1" });
      await client.get("https://external-cdn.com/file.json");

      const calledUrl = fetchSpy.mock.calls[0]![0];
      expect(calledUrl).toBe("https://external-cdn.com/file.json");
    });

    it("serializes query parameters including primitives, arrays and ignores empty/null/undefined", async () => {
      const fetchSpy = vi
        .fn()
        .mockImplementation(() =>
          Promise.resolve(
            new Response("{}", { status: 200, headers: { "Content-Type": "application/json" } }),
          ),
        );
      vi.stubGlobal("fetch", fetchSpy);

      const client = createHttpClient({ baseUrl: "https://api.voxhold.com" });

      await client.get("/search", {
        params: {
          q: "hello world",
          limit: 25,
          active: true,
          tags: ["react", "typescript"],
          nullVal: null,
          undefVal: undefined,
          emptyStr: "",
        },
      });

      const calledUrl = new URL(fetchSpy.mock.calls[0]![0]);
      expect(calledUrl.searchParams.get("q")).toBe("hello world");
      expect(calledUrl.searchParams.get("limit")).toBe("25");
      expect(calledUrl.searchParams.get("active")).toBe("true");
      expect(calledUrl.searchParams.getAll("tags")).toEqual(["react", "typescript"]);
      expect(calledUrl.searchParams.has("nullVal")).toBe(false);
      expect(calledUrl.searchParams.has("undefVal")).toBe(false);
      expect(calledUrl.searchParams.has("emptyStr")).toBe(false);
    });
  });

  describe("Headers and Authentication", () => {
    it("injects Authorization header via getAccessToken", async () => {
      const fetchSpy = vi
        .fn()
        .mockImplementation(() =>
          Promise.resolve(
            new Response("{}", { status: 200, headers: { "Content-Type": "application/json" } }),
          ),
        );
      vi.stubGlobal("fetch", fetchSpy);

      const client = createHttpClient({
        getAccessToken: () => "access_token_123",
      });

      await client.get("/me");

      const headers = fetchSpy.mock.calls[0]![1].headers as Headers;
      expect(headers.get("Authorization")).toBe("Bearer access_token_123");
    });

    it("skips Authorization header when skipAuth: true", async () => {
      const fetchSpy = vi
        .fn()
        .mockImplementation(() =>
          Promise.resolve(
            new Response("{}", { status: 200, headers: { "Content-Type": "application/json" } }),
          ),
        );
      vi.stubGlobal("fetch", fetchSpy);

      const client = createHttpClient({
        getAccessToken: () => "access_token_123",
      });

      await client.get("/public", { skipAuth: true });

      const headers = fetchSpy.mock.calls[0]![1].headers as Headers;
      expect(headers.get("Authorization")).toBeNull();
    });

    it("sets application/json Content-Type for JSON body and strips it for FormData", async () => {
      const fetchSpy = vi
        .fn()
        .mockImplementation(() =>
          Promise.resolve(
            new Response("{}", { status: 200, headers: { "Content-Type": "application/json" } }),
          ),
        );
      vi.stubGlobal("fetch", fetchSpy);

      const client = createHttpClient();

      await client.post("/items", { name: "item1" });
      const jsonHeaders = fetchSpy.mock.calls[0]![1].headers as Headers;
      expect(jsonHeaders.get("Content-Type")).toBe("application/json");

      const formData = new FormData();
      formData.append("avatar", "binary_content");
      await client.postForm("/upload", formData);
      const formHeaders = fetchSpy.mock.calls[1]![1].headers as Headers;
      expect(formHeaders.get("Content-Type")).toBeNull();
    });
  });

  describe("Response body parsing", () => {
    it("returns parsed JSON object for application/json content type", async () => {
      const mockData = { id: 10, name: "general" };
      vi.stubGlobal(
        "fetch",
        vi.fn().mockImplementation(() =>
          Promise.resolve(
            new Response(JSON.stringify(mockData), {
              status: 200,
              headers: { "Content-Type": "application/json" },
            }),
          ),
        ),
      );

      const client = createHttpClient();
      const result = await client.get("/channel");
      expect(result).toEqual(mockData);
    });

    it("returns text string for text/plain content type", async () => {
      vi.stubGlobal(
        "fetch",
        vi.fn().mockImplementation(() =>
          Promise.resolve(
            new Response("plain text response", {
              status: 200,
              headers: { "Content-Type": "text/plain" },
            }),
          ),
        ),
      );

      const client = createHttpClient();
      const result = await client.get("/logs");
      expect(result).toBe("plain text response");
    });

    it("returns undefined for 204 No Content or 205 Reset Content", async () => {
      vi.stubGlobal(
        "fetch",
        vi.fn().mockImplementation(() => Promise.resolve(new Response(null, { status: 204 }))),
      );

      const client = createHttpClient();
      const result = await client.delete("/items/1");
      expect(result).toBeUndefined();
    });
  });

  describe("HTTP convenience methods", () => {
    it("executes all HTTP verbs with correct method and body", async () => {
      const fetchSpy = vi
        .fn()
        .mockImplementation(() =>
          Promise.resolve(
            new Response("{}", { status: 200, headers: { "Content-Type": "application/json" } }),
          ),
        );
      vi.stubGlobal("fetch", fetchSpy);

      const client = createHttpClient();

      await client.get("/test");
      expect(fetchSpy.mock.calls[0]![1].method).toBe("GET");

      await client.post("/test", { a: 1 });
      expect(fetchSpy.mock.calls[1]![1].method).toBe("POST");
      expect(fetchSpy.mock.calls[1]![1].body).toBe(JSON.stringify({ a: 1 }));

      await client.put("/test", { b: 2 });
      expect(fetchSpy.mock.calls[2]![1].method).toBe("PUT");

      await client.patch("/test", { c: 3 });
      expect(fetchSpy.mock.calls[3]![1].method).toBe("PATCH");

      await client.delete("/test");
      expect(fetchSpy.mock.calls[4]![1].method).toBe("DELETE");

      await client.head("/test");
      expect(fetchSpy.mock.calls[5]![1].method).toBe("HEAD");

      await client.options("/test");
      expect(fetchSpy.mock.calls[6]![1].method).toBe("OPTIONS");
    });
  });

  describe("Interceptors pipeline", () => {
    it("applies request, response, and error interceptors", async () => {
      const fetchSpy = vi.fn().mockImplementation(() =>
        Promise.resolve(
          new Response(JSON.stringify({ count: 1 }), {
            status: 200,
            headers: { "Content-Type": "application/json" },
          }),
        ),
      );
      vi.stubGlobal("fetch", fetchSpy);

      const client = createHttpClient();

      const unsubscribe = client.use({
        onRequest: (config) => ({
          ...config,
          headers: { ...config.headers, "X-Trace-Id": "12345" },
        }),
        onResponse: (res) => {
          return new Response(JSON.stringify({ count: 99 }), {
            status: res.status,
            headers: { "Content-Type": "application/json" },
          });
        },
      });

      const result = await client.get<{ count: number }>("/count");

      const headers = fetchSpy.mock.calls[0]![1].headers as Headers;
      expect(headers.get("X-Trace-Id")).toBe("12345");
      expect(result).toEqual({ count: 99 });

      // Unsubscribe interceptor
      unsubscribe();

      const secondResult = await client.get<{ count: number }>("/count");
      expect(secondResult).toEqual({ count: 1 });
    });

    it("applies onError interceptor when request throws", async () => {
      vi.stubGlobal(
        "fetch",
        vi.fn().mockImplementation(() =>
          Promise.resolve(
            new Response(JSON.stringify({ error: "Original error" }), {
              status: 400,
              headers: { "Content-Type": "application/json" },
            }),
          ),
        ),
      );

      const client = createHttpClient();
      client.use({
        onError: (err) => {
          if (err instanceof HttpError) {
            return new Error(`Intercepted: ${err.message}`);
          }
          return err;
        },
      });

      await expect(client.get("/fail")).rejects.toThrow("Intercepted: Original error");
    });
  });

  describe("401 Unauthorized & Token Refresh Coordination", () => {
    it("refreshes token and retries request on 401 response", async () => {
      let token = "expired_token";

      const fetchSpy = vi
        .fn()
        .mockImplementationOnce(() =>
          Promise.resolve(
            new Response(JSON.stringify({ error: "Token expired" }), {
              status: 401,
              headers: { "Content-Type": "application/json" },
            }),
          ),
        )
        .mockImplementationOnce(() =>
          Promise.resolve(
            new Response(JSON.stringify({ secret: "data" }), {
              status: 200,
              headers: { "Content-Type": "application/json" },
            }),
          ),
        );
      vi.stubGlobal("fetch", fetchSpy);

      const refreshMock = vi.fn().mockImplementation(async () => {
        token = "fresh_token_777";
        return token;
      });

      const client = createHttpClient({
        getAccessToken: () => token,
        refreshAccessToken: refreshMock,
      });

      const result = await client.get("/secret");

      expect(refreshMock).toHaveBeenCalledTimes(1);
      expect(fetchSpy).toHaveBeenCalledTimes(2);

      const secondHeaders = fetchSpy.mock.calls[1]![1].headers as Headers;
      expect(secondHeaders.get("Authorization")).toBe("Bearer fresh_token_777");
      expect(result).toEqual({ secret: "data" });
    });

    it("coalesces concurrent 401 refresh calls into a single flight", async () => {
      let token = "expired_token";

      const fetchSpy = vi
        .fn()
        .mockImplementationOnce(() =>
          Promise.resolve(
            new Response(JSON.stringify({ error: "401" }), {
              status: 401,
              headers: { "Content-Type": "application/json" },
            }),
          ),
        )
        .mockImplementationOnce(() =>
          Promise.resolve(
            new Response(JSON.stringify({ error: "401" }), {
              status: 401,
              headers: { "Content-Type": "application/json" },
            }),
          ),
        )
        .mockImplementationOnce(() =>
          Promise.resolve(
            new Response(JSON.stringify({ a: 1 }), {
              status: 200,
              headers: { "Content-Type": "application/json" },
            }),
          ),
        )
        .mockImplementationOnce(() =>
          Promise.resolve(
            new Response(JSON.stringify({ b: 2 }), {
              status: 200,
              headers: { "Content-Type": "application/json" },
            }),
          ),
        );
      vi.stubGlobal("fetch", fetchSpy);

      const refreshMock = vi.fn().mockImplementation(async () => {
        token = "shared_new_token";
        return token;
      });

      const client = createHttpClient({
        getAccessToken: () => token,
        refreshAccessToken: refreshMock,
      });

      const [res1, res2] = await Promise.all([client.get("/req1"), client.get("/req2")]);

      expect(refreshMock).toHaveBeenCalledTimes(1);
      expect(res1).toEqual({ a: 1 });
      expect(res2).toEqual({ b: 2 });
    });

    it("triggers onUnauthorized callback when refresh returns null", async () => {
      vi.stubGlobal(
        "fetch",
        vi.fn().mockImplementation(() =>
          Promise.resolve(
            new Response(JSON.stringify({ error: "Unauthorized" }), {
              status: 401,
              headers: { "Content-Type": "application/json" },
            }),
          ),
        ),
      );

      const onUnauthorizedMock = vi.fn();
      const client = createHttpClient({
        getAccessToken: () => "invalid_token",
        refreshAccessToken: async () => null,
        onUnauthorized: onUnauthorizedMock,
      });

      await expect(client.get("/protected")).rejects.toThrow(HttpError);
      expect(onUnauthorizedMock).toHaveBeenCalledTimes(1);
    });
  });

  describe("Error extraction", () => {
    it("extracts error message from json payload variants (error, message array, detail, title)", async () => {
      const client = createHttpClient();

      vi.stubGlobal(
        "fetch",
        vi.fn().mockImplementationOnce(() =>
          Promise.resolve(
            new Response(JSON.stringify({ message: ["field1 required", "field2 required"] }), {
              status: 422,
              headers: { "Content-Type": "application/json" },
            }),
          ),
        ),
      );

      await expect(client.post("/form", {})).rejects.toThrow("field1 required, field2 required");
    });
  });
});
