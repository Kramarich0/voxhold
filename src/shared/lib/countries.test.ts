import { describe, expect, it } from "vitest";
import { COUNTRIES, ISO_COUNTRY_CODES } from "./countries";

describe("countries utility", () => {
  describe("ISO_COUNTRY_CODES dataset", () => {
    it("contains valid 2-letter uppercase ISO country codes", () => {
      expect(ISO_COUNTRY_CODES.length).toBeGreaterThan(200);

      for (const code of ISO_COUNTRY_CODES) {
        expect(code).toMatch(/^[A-Z]{2}$/);
      }
    });

    it("has no duplicate country codes", () => {
      const uniqueCodes = new Set(ISO_COUNTRY_CODES);
      expect(uniqueCodes.size).toBe(ISO_COUNTRY_CODES.length);
    });
  });

  describe("COUNTRIES mapped list", () => {
    it("maps every ISO country code to a CountryOption item", () => {
      expect(COUNTRIES.length).toBe(ISO_COUNTRY_CODES.length);
    });

    it("generates correct lowercase flag URLs", () => {
      const sampleCountries = [
        { code: "US", expectedUrl: "/flags/us.svg" },
        { code: "AM", expectedUrl: "/flags/am.svg" },
        { code: "DE", expectedUrl: "/flags/de.svg" },
        { code: "JP", expectedUrl: "/flags/jp.svg" },
      ];

      for (const { code, expectedUrl } of sampleCountries) {
        const country = COUNTRIES.find((c) => c.code === code);
        expect(country).toBeDefined();
        expect(country?.flagUrl).toBe(expectedUrl);
      }

      for (const country of COUNTRIES) {
        expect(country.flagUrl).toBe(`/flags/${country.code.toLowerCase()}.svg`);
      }
    });

    it("resolves English country labels correctly via Intl.DisplayNames", () => {
      const expectations = [
        { code: "US", expectedLabel: "United States" },
        { code: "DE", expectedLabel: "Germany" },
        { code: "FR", expectedLabel: "France" },
        { code: "AM", expectedLabel: "Armenia" },
        { code: "GB", expectedLabel: "United Kingdom" },
        { code: "JP", expectedLabel: "Japan" },
      ];

      for (const { code, expectedLabel } of expectations) {
        const country = COUNTRIES.find((c) => c.code === code);
        expect(country).toBeDefined();
        expect(country?.label).toBe(expectedLabel);
      }
    });

    it("sorts the countries list alphabetically by label in ascending order", () => {
      for (let i = 0; i < COUNTRIES.length - 1; i++) {
        const current = COUNTRIES[i]!;
        const next = COUNTRIES[i + 1]!;

        const comparison = current.label.localeCompare(next.label);
        expect(comparison).toBeLessThanOrEqual(0);
      }
    });

    it("guarantees every item contains non-empty code, label, and flagUrl", () => {
      for (const country of COUNTRIES) {
        expect(country.code).toBeTypeOf("string");
        expect(country.label).toBeTypeOf("string");
        expect(country.flagUrl).toBeTypeOf("string");

        expect(country.code.length).toBe(2);
        expect(country.label.trim().length).toBeGreaterThan(0);
        expect(country.flagUrl).toMatch(/^\/flags\/[a-z]{2}\.svg$/);
      }
    });
  });
});
