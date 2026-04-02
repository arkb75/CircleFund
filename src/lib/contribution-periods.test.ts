import { describe, expect, it } from "vitest";

import {
  formatDateOnly,
  getContributionPeriodStart,
  parseDateOnlyString,
} from "@/lib/contribution-periods";

describe("contribution period helpers", () => {
  it("parses valid date-only values", () => {
    const parsedDate = parseDateOnlyString("2026-04-18");

    expect(parsedDate).not.toBeNull();
    expect(formatDateOnly(parsedDate!)).toBe("2026-04-18");
  });

  it("rejects invalid date-only values", () => {
    expect(parseDateOnlyString("2026-02-31")).toBeNull();
    expect(parseDateOnlyString("04/18/2026")).toBeNull();
  });

  it("derives the first day of the calendar month as the period start", () => {
    const parsedDate = parseDateOnlyString("2026-04-18");

    expect(formatDateOnly(getContributionPeriodStart(parsedDate!))).toBe("2026-04-01");
  });
});
