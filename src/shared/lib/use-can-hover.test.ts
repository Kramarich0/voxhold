import { act, renderHook } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { useCanHover } from "./use-can-hover";

describe("useCanHover hook", () => {
  let changeListeners: Array<(event: MediaQueryListEvent) => void> = [];
  let currentMatches = false;

  const mockMatchMedia = (initialMatches: boolean) => {
    currentMatches = initialMatches;
    changeListeners = [];

    return vi.fn().mockImplementation((query: string) => ({
      get matches() {
        return currentMatches;
      },
      media: query,
      onchange: null,
      addListener: vi.fn(),
      removeListener: vi.fn(),
      addEventListener: vi.fn((event: string, listener: (event: MediaQueryListEvent) => void) => {
        if (event === "change") {
          changeListeners.push(listener);
        }
      }),
      removeEventListener: vi.fn(
        (event: string, listener: (event: MediaQueryListEvent) => void) => {
          if (event === "change") {
            changeListeners = changeListeners.filter((l) => l !== listener);
          }
        },
      ),
      dispatchEvent: vi.fn(),
    }));
  };

  const dispatchMediaChange = (newMatches: boolean) => {
    currentMatches = newMatches;
    for (const listener of changeListeners) {
      listener({ matches: newMatches } as MediaQueryListEvent);
    }
  };

  afterEach(() => {
    vi.restoreAllMocks();
    changeListeners = [];
  });

  it("queries the correct media query string", () => {
    const matchMediaSpy = mockMatchMedia(true);
    Object.defineProperty(window, "matchMedia", {
      writable: true,
      value: matchMediaSpy,
    });

    renderHook(() => useCanHover());

    expect(matchMediaSpy).toHaveBeenCalledWith("(hover: hover) and (pointer: fine)");
  });

  it("returns true when device supports hover and fine pointer", () => {
    Object.defineProperty(window, "matchMedia", {
      writable: true,
      value: mockMatchMedia(true),
    });

    const { result } = renderHook(() => useCanHover());

    expect(result.current).toBe(true);
  });

  it("returns false when device does not support hover (e.g. mobile/touch)", () => {
    Object.defineProperty(window, "matchMedia", {
      writable: true,
      value: mockMatchMedia(false),
    });

    const { result } = renderHook(() => useCanHover());

    expect(result.current).toBe(false);
  });

  it("updates value reactively when media query change event is fired", () => {
    Object.defineProperty(window, "matchMedia", {
      writable: true,
      value: mockMatchMedia(false),
    });

    const { result } = renderHook(() => useCanHover());
    expect(result.current).toBe(false);

    act(() => {
      dispatchMediaChange(true);
    });

    expect(result.current).toBe(true);

    act(() => {
      dispatchMediaChange(false);
    });

    expect(result.current).toBe(false);
  });

  it("removes event listener on unmount to prevent memory leaks", () => {
    Object.defineProperty(window, "matchMedia", {
      writable: true,
      value: mockMatchMedia(true),
    });

    const { unmount } = renderHook(() => useCanHover());
    expect(changeListeners.length).toBe(1);

    unmount();

    expect(changeListeners.length).toBe(0);
  });
});
