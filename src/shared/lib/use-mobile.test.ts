import { act, renderHook } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { useIsMobile } from "./use-mobile";

describe("useIsMobile hook", () => {
  let changeListeners: Array<() => void> = [];

  const setViewportWidth = (width: number) => {
    Object.defineProperty(window, "innerWidth", {
      writable: true,
      configurable: true,
      value: width,
    });
  };

  const mockMatchMedia = () => {
    changeListeners = [];

    return vi.fn().mockImplementation((query: string) => ({
      matches: window.innerWidth < 768,
      media: query,
      onchange: null,
      addListener: vi.fn(),
      removeListener: vi.fn(),
      addEventListener: vi.fn((event: string, listener: () => void) => {
        if (event === "change") {
          changeListeners.push(listener);
        }
      }),
      removeEventListener: vi.fn((event: string, listener: () => void) => {
        if (event === "change") {
          changeListeners = changeListeners.filter((l) => l !== listener);
        }
      }),
      dispatchEvent: vi.fn(),
    }));
  };

  const triggerResize = (newWidth: number) => {
    setViewportWidth(newWidth);
    for (const listener of changeListeners) {
      listener();
    }
  };

  beforeEach(() => {
    Object.defineProperty(window, "matchMedia", {
      writable: true,
      configurable: true,
      value: mockMatchMedia(),
    });
  });

  afterEach(() => {
    vi.restoreAllMocks();
    changeListeners = [];
  });

  it("returns true when viewport width is below mobile breakpoint (< 768px)", () => {
    setViewportWidth(500);

    const { result } = renderHook(() => useIsMobile());

    expect(result.current).toBe(true);
  });

  it("returns false when viewport width is at or above breakpoint (>= 768px)", () => {
    setViewportWidth(768);

    const { result } = renderHook(() => useIsMobile());

    expect(result.current).toBe(false);
  });

  it("subscribes to the correct max-width media query '(max-width: 767px)'", () => {
    const matchMediaSpy = mockMatchMedia();
    window.matchMedia = matchMediaSpy;

    renderHook(() => useIsMobile());

    expect(matchMediaSpy).toHaveBeenCalledWith("(max-width: 767px)");
  });

  it("updates return value reactively when screen size changes", () => {
    setViewportWidth(1024);

    const { result } = renderHook(() => useIsMobile());
    expect(result.current).toBe(false);

    act(() => {
      triggerResize(375);
    });
    expect(result.current).toBe(true);

    act(() => {
      triggerResize(1200);
    });
    expect(result.current).toBe(false);
  });

  it("removes event listener on unmount", () => {
    setViewportWidth(1024);

    const { unmount } = renderHook(() => useIsMobile());
    expect(changeListeners.length).toBe(1);

    unmount();
    expect(changeListeners.length).toBe(0);
  });
});
