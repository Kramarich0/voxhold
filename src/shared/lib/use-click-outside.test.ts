import { act, renderHook } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { useClickOutside } from "./use-click-outside";

describe("useClickOutside hook", () => {
  let container: HTMLDivElement;
  let insideElement: HTMLDivElement;
  let outsideElement: HTMLDivElement;

  beforeEach(() => {
    container = document.createElement("div");
    insideElement = document.createElement("div");
    outsideElement = document.createElement("div");

    container.appendChild(insideElement);
    document.body.appendChild(container);
    document.body.appendChild(outsideElement);
  });

  afterEach(() => {
    document.body.removeChild(container);
    document.body.removeChild(outsideElement);
  });

  it("calls callback when clicking outside the referenced element", () => {
    const callback = vi.fn();
    const ref = { current: insideElement };

    renderHook(() => useClickOutside(ref, callback));

    act(() => {
      outsideElement.dispatchEvent(new MouseEvent("mousedown", { bubbles: true }));
    });

    expect(callback).toHaveBeenCalledTimes(1);
  });

  it("does not call callback when clicking inside the referenced element", () => {
    const callback = vi.fn();
    const ref = { current: insideElement };

    renderHook(() => useClickOutside(ref, callback));

    act(() => {
      insideElement.dispatchEvent(new MouseEvent("mousedown", { bubbles: true }));
    });

    expect(callback).not.toHaveBeenCalled();
  });

  it("handles touchstart events outside the referenced element", () => {
    const callback = vi.fn();
    const ref = { current: insideElement };

    renderHook(() => useClickOutside(ref, callback));

    act(() => {
      outsideElement.dispatchEvent(new TouchEvent("touchstart", { bubbles: true }));
    });

    expect(callback).toHaveBeenCalledTimes(1);
  });

  it("does not trigger callback when enabled is false", () => {
    const callback = vi.fn();
    const ref = { current: insideElement };

    renderHook(() => useClickOutside(ref, callback, false));

    act(() => {
      outsideElement.dispatchEvent(new MouseEvent("mousedown", { bubbles: true }));
    });

    expect(callback).not.toHaveBeenCalled();
  });

  it("does not trigger callback when ref.current is null", () => {
    const callback = vi.fn();
    const ref = { current: null };

    renderHook(() => useClickOutside(ref, callback));

    act(() => {
      outsideElement.dispatchEvent(new MouseEvent("mousedown", { bubbles: true }));
    });

    expect(callback).not.toHaveBeenCalled();
  });

  it("removes event listeners on unmount", () => {
    const callback = vi.fn();
    const ref = { current: insideElement };

    const { unmount } = renderHook(() => useClickOutside(ref, callback));

    unmount();

    act(() => {
      outsideElement.dispatchEvent(new MouseEvent("mousedown", { bubbles: true }));
    });

    expect(callback).not.toHaveBeenCalled();
  });
});
