import { describe, expect, it } from "vitest";
import {
  formatDateDivider,
  formatFullDateTime,
  formatShortDateTime,
  formatTime,
  isSameDayTimestamp,
  toDate,
} from "./date";

describe("date utilities", () => {
  // 1700000000 = Tuesday, November 14, 2023 22:13:20 UTC
  const testTimestamp = 1_700_000_000;

  it("converts seconds timestamp to JavaScript Date object", () => {
    const date = toDate(testTimestamp);
    expect(date.getTime()).toBe(testTimestamp * 1000);
  });

  it("formats time string properly (HH:mm)", () => {
    const formatted = formatTime(testTimestamp);
    expect(formatted).toMatch(/^\d{2}:\d{2}$/);
  });

  it("formats date divider properly (MMMM d, yyyy)", () => {
    const formatted = formatDateDivider(testTimestamp);
    expect(formatted).toMatch(/^[A-Z][a-z]+ \d{1,2}, \d{4}$/);
  });

  it("formats short date time for cards (MMM d, HH:mm)", () => {
    const formatted = formatShortDateTime(testTimestamp);
    expect(formatted).toMatch(/^[A-Z][a-z]{2} \d{1,2}, \d{2}:\d{2}$/);
  });

  it("formats full date time for tooltips (PPPP 'at' p)", () => {
    const formatted = formatFullDateTime(testTimestamp);
    expect(formatted).toContain(" at ");
  });

  it("identifies timestamps on the same vs different calendar days", () => {
    const morning = testTimestamp;
    const afternoon = testTimestamp + 3600 * 2; // +2 hours
    const nextDay = testTimestamp + 3600 * 24; // +24 hours

    expect(isSameDayTimestamp(morning, afternoon)).toBe(true);
    expect(isSameDayTimestamp(morning, nextDay)).toBe(false);
  });
});
