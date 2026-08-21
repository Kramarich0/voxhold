import { act, renderHook, waitFor } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import type { AutocompleteEmoji } from "@/entities/message/model/message.types";
import { useEmojiAutocomplete } from "./use-emoji-autocomplete";

describe("useEmojiAutocomplete hook", () => {
  const renderLoadedHook = async (serverEmojis?: AutocompleteEmoji[]) => {
    const hook = renderHook(() => useEmojiAutocomplete(serverEmojis));

    await waitFor(() => {
      act(() => {
        hook.result.current.checkAutocomplete(":a", 2);
      });
      expect(hook.result.current.isOpen).toBe(true);
    });

    act(() => {
      hook.result.current.closeAutocomplete();
    });

    return hook;
  };

  describe("initial state", () => {
    it("starts closed with no suggestions and null query", async () => {
      const { result } = await renderLoadedHook();

      expect(result.current.isOpen).toBe(false);
      expect(result.current.query).toBeNull();
      expect(result.current.matchIndex).toBe(-1);
      expect(result.current.suggestions).toEqual([]);
      expect(result.current.selectedIndex).toBe(0);
    });
  });

  describe("checkAutocomplete trigger & parsing", () => {
    it("opens autocomplete when typing colon followed by matching letters", async () => {
      const { result } = await renderLoadedHook();

      act(() => {
        result.current.checkAutocomplete(":sm", 3);
      });

      expect(result.current.isOpen).toBe(true);
      expect(result.current.query).toBe("sm");
      expect(result.current.matchIndex).toBe(0);
      expect(result.current.suggestions.length).toBeGreaterThan(0);
      expect(
        result.current.suggestions.some(
          (s) => s.name.includes("sm") || s.keywords?.some((k) => k.startsWith("sm")),
        ),
      ).toBe(true);
    });

    it("detects emoji triggers in the middle of a sentence based on cursor position", async () => {
      const { result } = await renderLoadedHook();
      const text = "Hello :fir world";
      const cursorPosition = 10;

      act(() => {
        result.current.checkAutocomplete(text, cursorPosition);
      });

      expect(result.current.isOpen).toBe(true);
      expect(result.current.query).toBe("fir");
      expect(result.current.matchIndex).toBe(6);
      expect(
        result.current.suggestions.some((s) => s.id === "fire" || s.name.startsWith("fir")),
      ).toBe(true);
    });

    it("ignores plain text without colon triggers", async () => {
      const { result } = await renderLoadedHook();

      act(() => {
        result.current.checkAutocomplete("Hello world without emoji", 11);
      });

      expect(result.current.isOpen).toBe(false);
      expect(result.current.query).toBeNull();
      expect(result.current.matchIndex).toBe(-1);
    });

    it("ignores colons followed by spaces or special non-alphanumeric characters", async () => {
      const { result } = await renderLoadedHook();

      act(() => {
        result.current.checkAutocomplete("Hello : world", 8);
      });

      expect(result.current.isOpen).toBe(false);
      expect(result.current.query).toBeNull();

      act(() => {
        result.current.checkAutocomplete("Check this :!@#", 14);
      });

      expect(result.current.isOpen).toBe(false);
      expect(result.current.query).toBeNull();
    });

    it("ignores queries exceeding 15 characters limit", async () => {
      const { result } = await renderLoadedHook();
      const longQuery = ":" + "a".repeat(16);

      act(() => {
        result.current.checkAutocomplete(longQuery, longQuery.length);
      });

      expect(result.current.isOpen).toBe(false);
      expect(result.current.query).toBeNull();
    });
  });

  describe("keywords matching", () => {
    it("matches emoji by keyword (e.g. :cry finds crying emojis)", async () => {
      const { result } = await renderLoadedHook();

      act(() => {
        result.current.checkAutocomplete(":cry", 4);
      });

      expect(result.current.isOpen).toBe(true);
      expect(
        result.current.suggestions.some(
          (s) => s.name.includes("cry") || s.keywords?.some((k) => k.startsWith("cry")),
        ),
      ).toBe(true);
    });
  });

  describe("custom server emojis", () => {
    it("prioritizes custom server emojis at the top of suggestions", async () => {
      const customEmojis: AutocompleteEmoji[] = [
        {
          id: "custom_fire",
          name: "fire_custom",
          url: "https://cdn.voxhold.com/emojis/fire.png",
          keywords: ["hot"],
          isCustom: true,
        },
      ];

      const { result } = await renderLoadedHook(customEmojis);

      act(() => {
        result.current.checkAutocomplete(":fir", 4);
      });

      expect(result.current.isOpen).toBe(true);
      expect(result.current.suggestions[0]?.id).toBe("custom_fire");
      expect(result.current.suggestions[0]?.isCustom).toBe(true);
    });
  });

  describe("selectedIndex and closing", () => {
    it("allows changing selectedIndex and resets to 0 on new query input", async () => {
      const { result } = await renderLoadedHook();

      act(() => {
        result.current.checkAutocomplete(":sm", 3);
      });
      expect(result.current.isOpen).toBe(true);

      act(() => {
        result.current.setSelectedIndex(2);
      });
      expect(result.current.selectedIndex).toBe(2);

      act(() => {
        result.current.checkAutocomplete(":smi", 4);
      });
      expect(result.current.selectedIndex).toBe(0);
    });

    it("closes autocomplete and clears state on closeAutocomplete()", async () => {
      const { result } = await renderLoadedHook();

      act(() => {
        result.current.checkAutocomplete(":fire", 5);
      });
      expect(result.current.isOpen).toBe(true);

      act(() => {
        result.current.closeAutocomplete();
      });

      expect(result.current.isOpen).toBe(false);
      expect(result.current.query).toBeNull();
      expect(result.current.matchIndex).toBe(-1);
      expect(result.current.suggestions).toEqual([]);
    });
  });
});
