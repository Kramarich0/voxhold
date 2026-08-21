import { describe, expect, it } from "vitest";
import { cn } from "./cn";

describe("cn utility", () => {
  describe("basic class merging", () => {
    it("joins multiple string class names", () => {
      const result = cn("flex", "items-center", "gap-2");
      expect(result).toBe("flex items-center gap-2");
    });

    it("returns an empty string when called with no arguments", () => {
      expect(cn()).toBe("");
    });
  });

  describe("falsy and conditional values", () => {
    it("ignores falsy values (false, null, undefined, 0, empty strings)", () => {
      const result = cn("base-class", false && "hidden", null, undefined, 0, "", "visible-class");

      expect(result).toBe("base-class visible-class");
    });

    it("handles conditionally rendered classes based on boolean flags", () => {
      const isActive = true;
      const isDisabled = false;

      const result = cn("btn", isActive && "btn-active", isDisabled && "btn-disabled");

      expect(result).toBe("btn btn-active");
    });
  });

  describe("objects and arrays (clsx features)", () => {
    it("supports object syntax with boolean values", () => {
      const result = cn({
        "bg-primary": true,
        "text-white": true,
        "opacity-50": false,
      });

      expect(result).toBe("bg-primary text-white");
    });

    it("supports nested arrays and mixed inputs", () => {
      const result = cn("text-sm", ["font-bold", false && "italic"], { "rounded-md": true });

      expect(result).toBe("text-sm font-bold rounded-md");
    });
  });

  describe("tailwind conflicts resolution (twMerge features)", () => {
    it("resolves direct property conflicts (last one wins)", () => {
      const result = cn("p-2", "p-4");
      expect(result).toBe("p-4");
    });

    it("resolves color conflicts correctly", () => {
      const result = cn("text-red-500", "text-blue-500");
      expect(result).toBe("text-blue-500");
    });

    it("resolves directional padding and margin overrides correctly", () => {
      const result = cn("pl-2 pr-2 pt-2", "px-4");
      expect(result).toBe("pt-2 px-4");
    });

    it("preserves modifier variants (hover, dark, md)", () => {
      const result = cn("bg-white hover:bg-gray-100", "bg-black hover:bg-gray-900");

      expect(result).toBe("bg-black hover:bg-gray-900");
    });
  });
});
