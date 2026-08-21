import { describe, expect, it } from "vitest";
import { getInitials } from "./get-initials";

describe("getInitials utility", () => {
  describe("when full name is provided", () => {
    it("returns uppercase initials from first and second name", () => {
      expect(getInitials("John Doe")).toBe("JD");
      expect(getInitials("artur petrosyan")).toBe("AP");
    });

    it("takes only the first two words when three or more words are given", () => {
      expect(getInitials("John Middle Doe")).toBe("JM");
      expect(getInitials("Alexander von Humboldt")).toBe("AV");
    });

    it("handles multiple spaces and tabs between words correctly", () => {
      expect(getInitials("  John    Doe  ")).toBe("JD");
      expect(getInitials("John\t\tDoe")).toBe("JD");
    });
  });

  describe("when single word name is provided", () => {
    it("returns single uppercase letter", () => {
      expect(getInitials("Administrator")).toBe("A");
      expect(getInitials("alex")).toBe("A");
    });

    it("handles single name with surrounding whitespace", () => {
      expect(getInitials("   artur   ")).toBe("A");
    });

    it("treats hyphenated names as a single word", () => {
      expect(getInitials("jean-paul")).toBe("J");
    });
  });

  describe("when name is missing and email fallback is used", () => {
    it("falls back to first letter of email when name is null", () => {
      expect(getInitials(null, "support@voxhold.com")).toBe("S");
      expect(getInitials(null, "alex@domain.org")).toBe("A");
    });

    it("falls back to first letter of email when name is undefined", () => {
      expect(getInitials(undefined, "dev@voxhold.com")).toBe("D");
    });

    it("trims whitespace from email before taking initial", () => {
      expect(getInitials(undefined, "   artur@voxhold.com   ")).toBe("A");
    });
  });

  describe("fallback to default 'U'", () => {
    it("returns 'U' when both name and email are null or undefined", () => {
      expect(getInitials(null, null)).toBe("U");
      expect(getInitials(undefined, undefined)).toBe("U");
    });

    it("returns 'U' when called with no arguments", () => {
      expect(getInitials()).toBe("U");
    });

    it("returns 'U' when email is an empty or whitespace-only string and name is null", () => {
      expect(getInitials(null, "")).toBe("U");
      expect(getInitials(null, "   ")).toBe("U");
    });
  });
});
