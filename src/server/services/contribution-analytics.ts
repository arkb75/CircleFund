import type { ContributionHistoryResponse } from "@/lib/api-types";
import { formatContributionPeriodLabel, formatDateOnly } from "@/lib/contribution-periods";
import { centsToDollars, formatUsdFromCents } from "@/lib/money";

type ContributionEntry = {
  id: string;
  amountCents: number;
  contributedOn: Date;
  periodStart: Date;
  createdAt: Date;
  recordedByUser: {
    id: string;
    name: string;
  };
};

export function buildContributionSummary(
  minimumMonthlyContributionCents: number,
  contributions: Array<{ amountCents: number }>,
) {
  const totalCents = contributions.reduce(
    (sum, contribution) => sum + contribution.amountCents,
    0,
  );
  const remainingCents = Math.max(minimumMonthlyContributionCents - totalCents, 0);

  return {
    total: centsToDollars(totalCents),
    totalFormatted: formatUsdFromCents(totalCents),
    remaining: centsToDollars(remainingCents),
    remainingFormatted: formatUsdFromCents(remainingCents),
  };
}

export function buildContributionHistoryPeriods(
  minimumMonthlyContributionCents: number,
  contributions: ContributionEntry[],
): ContributionHistoryResponse["periods"] {
  const groupedPeriods = new Map<string, ContributionEntry[]>();

  for (const contribution of contributions) {
    const periodKey = formatDateOnly(contribution.periodStart);
    const existingGroup = groupedPeriods.get(periodKey) ?? [];
    existingGroup.push(contribution);
    groupedPeriods.set(periodKey, existingGroup);
  }

  return Array.from(groupedPeriods.entries())
    .sort(([leftKey], [rightKey]) => rightKey.localeCompare(leftKey))
    .map(([periodKey, periodContributions]) => {
      const sortedEntries = periodContributions
        .slice()
        .sort((left, right) => {
          const contributedOnDifference =
            right.contributedOn.getTime() - left.contributedOn.getTime();

          if (contributedOnDifference !== 0) {
            return contributedOnDifference;
          }

          return right.createdAt.getTime() - left.createdAt.getTime();
        });
      const periodStart = sortedEntries[0]?.periodStart;
      const totals = buildContributionSummary(
        minimumMonthlyContributionCents,
        sortedEntries,
      );

      return {
        periodStart: periodKey,
        label: periodStart
          ? formatContributionPeriodLabel(periodStart)
          : formatContributionPeriodLabel(new Date(`${periodKey}T00:00:00.000Z`)),
        totalAmount: totals.total,
        totalAmountFormatted: totals.totalFormatted,
        minimumTarget: centsToDollars(minimumMonthlyContributionCents),
        minimumTargetFormatted: formatUsdFromCents(minimumMonthlyContributionCents),
        remainingAmount: totals.remaining,
        remainingAmountFormatted: totals.remainingFormatted,
        entries: sortedEntries.map((contribution) => ({
          id: contribution.id,
          amount: centsToDollars(contribution.amountCents),
          amountFormatted: formatUsdFromCents(contribution.amountCents),
          contributedOn: formatDateOnly(contribution.contributedOn),
          recordedAt: contribution.createdAt.toISOString(),
          recordedBy: {
            id: contribution.recordedByUser.id,
            name: contribution.recordedByUser.name,
          },
        })),
      };
    });
}
