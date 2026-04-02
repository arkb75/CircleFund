import { describe, expect, it } from "vitest";

import {
  buildContributionHistoryPeriods,
  buildContributionSummary,
} from "@/server/services/contribution-analytics";

describe("contribution analytics", () => {
  it("calculates total and remaining amounts for the current month", () => {
    const summary = buildContributionSummary(25_000, [
      { amountCents: 5_000 },
      { amountCents: 7_500 },
    ]);

    expect(summary.total).toBe(125);
    expect(summary.totalFormatted).toBe("$125.00");
    expect(summary.remaining).toBe(125);
    expect(summary.remainingFormatted).toBe("$125.00");
  });

  it("groups contribution history by calendar month and orders newest first", () => {
    const periods = buildContributionHistoryPeriods(25_000, [
      {
        id: "contribution_1",
        amountCents: 10_000,
        contributedOn: new Date("2026-04-18T00:00:00.000Z"),
        periodStart: new Date("2026-04-01T00:00:00.000Z"),
        createdAt: new Date("2026-04-18T14:00:00.000Z"),
        recordedByUser: {
          id: "user_1",
          name: "Amina Yusuf",
        },
      },
      {
        id: "contribution_2",
        amountCents: 8_000,
        contributedOn: new Date("2026-04-05T00:00:00.000Z"),
        periodStart: new Date("2026-04-01T00:00:00.000Z"),
        createdAt: new Date("2026-04-05T14:00:00.000Z"),
        recordedByUser: {
          id: "user_2",
          name: "Musa Ali",
        },
      },
      {
        id: "contribution_3",
        amountCents: 25_000,
        contributedOn: new Date("2026-03-28T00:00:00.000Z"),
        periodStart: new Date("2026-03-01T00:00:00.000Z"),
        createdAt: new Date("2026-03-28T14:00:00.000Z"),
        recordedByUser: {
          id: "user_1",
          name: "Amina Yusuf",
        },
      },
    ]);

    expect(periods).toHaveLength(2);
    expect(periods[0]?.periodStart).toBe("2026-04-01");
    expect(periods[0]?.totalAmountFormatted).toBe("$180.00");
    expect(periods[0]?.remainingAmountFormatted).toBe("$70.00");
    expect(periods[0]?.entries[0]?.id).toBe("contribution_1");
    expect(periods[1]?.periodStart).toBe("2026-03-01");
    expect(periods[1]?.remainingAmountFormatted).toBe("$0.00");
  });
});
