import { act, renderHook } from "@testing-library/react";
import { toast } from "sonner";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { useCopyToClipboard } from "./use-copy-to-clipboard";

vi.mock("sonner", () => ({
  toast: {
    error: vi.fn(),
    success: vi.fn(),
  },
}));

describe("useCopyToClipboard hook", () => {
  let writeTextMock: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    vi.clearAllMocks();
    vi.useFakeTimers();

    writeTextMock = vi.fn().mockResolvedValue(undefined);
    Object.defineProperty(navigator, "clipboard", {
      value: { writeText: writeTextMock },
      writable: true,
      configurable: true,
    });
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("initializes with isCopied as false", () => {
    const { result } = renderHook(() => useCopyToClipboard());
    expect(result.current.isCopied).toBe(false);
  });

  it("copies text successfully and resets isCopied after default timeout (2000ms)", async () => {
    const { result } = renderHook(() => useCopyToClipboard());

    await act(async () => {
      await result.current.copy("Hello Voxhold!");
    });

    expect(writeTextMock).toHaveBeenCalledWith("Hello Voxhold!");
    expect(result.current.isCopied).toBe(true);

    act(() => {
      vi.advanceTimersByTime(1999);
    });
    expect(result.current.isCopied).toBe(true);

    act(() => {
      vi.advanceTimersByTime(1);
    });
    expect(result.current.isCopied).toBe(false);
  });

  it("respects custom timeout duration", async () => {
    const customTimeout = 5000;
    const { result } = renderHook(() => useCopyToClipboard(customTimeout));

    await act(async () => {
      await result.current.copy("Custom timeout test");
    });

    expect(result.current.isCopied).toBe(true);

    act(() => {
      vi.advanceTimersByTime(3000);
    });
    expect(result.current.isCopied).toBe(true);

    act(() => {
      vi.advanceTimersByTime(2000);
    });
    expect(result.current.isCopied).toBe(false);
  });

  it("shows error toast when navigator.clipboard is unavailable", async () => {
    // @ts-expect-error delete property to test API unavailability
    delete navigator.clipboard;
    // @ts-expect-error also delete from prototype in case of JSDOM environment
    delete Navigator.prototype.clipboard;

    const { result } = renderHook(() => useCopyToClipboard());

    await act(async () => {
      await result.current.copy("some text");
    });

    expect(result.current.isCopied).toBe(false);
    expect(toast.error).toHaveBeenCalledWith("Clipboard API not available");
  });

  it("handles clipboard writeText rejection gracefully", async () => {
    const consoleSpy = vi.spyOn(console, "error").mockImplementation(() => {});
    writeTextMock.mockRejectedValueOnce(new Error("Permission denied"));

    const { result } = renderHook(() => useCopyToClipboard());

    await act(async () => {
      await result.current.copy("forbidden text");
    });

    expect(result.current.isCopied).toBe(false);
    expect(toast.error).toHaveBeenCalledWith("Copy failed");
    expect(consoleSpy).toHaveBeenCalled();
  });
});
