import {
  MembershipRole,
  MembershipStatus,
} from "@/generated/prisma/client";
import {
  formatContributionPeriodLabel,
  formatDateOnly,
  getCurrentContributionPeriodStart,
} from "@/lib/contribution-periods";
import type { CircleDashboardResponse } from "@/lib/api-types";
import { centsToDollars, formatUsdFromCents } from "@/lib/money";
import { prisma } from "@/lib/prisma";
import {
  findCircleDashboard,
  findLatestMembershipForUser,
} from "@/server/data/circle-repository";
import { buildContributionSummary } from "@/server/services/contribution-analytics";
import { ServiceError } from "@/server/services/service-error";

const rolePriority: Record<MembershipRole, number> = {
  ADMIN: 0,
  MEMBER: 1,
};

export async function getLatestCircleRedirect(userId: string) {
  const latestMembership = await findLatestMembershipForUser(prisma, userId);

  if (!latestMembership || latestMembership.status === MembershipStatus.SUSPENDED) {
    return null;
  }

  return `/circles/${latestMembership.circleId}`;
}

export async function getCircleDashboardForUser(
  circleId: string,
  userId: string,
): Promise<CircleDashboardResponse> {
  const currentContributionPeriodStart = getCurrentContributionPeriodStart();
  const circle = await findCircleDashboard(
    prisma,
    circleId,
    currentContributionPeriodStart,
  );

  if (!circle || !circle.rule) {
    throw new ServiceError(404, "CIRCLE_NOT_FOUND", "Circle not found.");
  }

  const circleRule = circle.rule;

  const viewerMembership = circle.memberships.find(
    (membership) => membership.userId === userId,
  );

  if (!viewerMembership || viewerMembership.status === MembershipStatus.SUSPENDED) {
    throw new ServiceError(403, "CIRCLE_ACCESS_DENIED", "You do not have access to this circle.");
  }

  const members = circle.memberships
    .slice()
    .sort((left, right) => {
      const roleDifference = rolePriority[left.role] - rolePriority[right.role];

      if (roleDifference !== 0) {
        return roleDifference;
      }

      return left.user.name.localeCompare(right.user.name);
    })
    .map((membership) => {
      const contributionSummary = buildContributionSummary(
        circleRule.minimumMonthlyContributionCents,
        membership.contributions,
      );

      return {
        membershipId: membership.id,
        id: membership.user.id,
        name: membership.user.name,
        email: membership.user.email,
        role: membership.role,
        status: membership.status,
        joinedAt: membership.createdAt.toISOString(),
        currentContributionTotal: contributionSummary.total,
        currentContributionTotalFormatted: contributionSummary.totalFormatted,
        currentContributionRemaining: contributionSummary.remaining,
        currentContributionRemainingFormatted: contributionSummary.remainingFormatted,
      };
    });

  return {
    circle: {
      id: circle.id,
      name: circle.name,
      inviteCode: circle.inviteCode,
      currentContributionPeriodStart: formatDateOnly(currentContributionPeriodStart),
      currentContributionPeriodLabel: formatContributionPeriodLabel(
        currentContributionPeriodStart,
      ),
      approvalMode: circleRule.approvalMode,
      minimumMonthlyContribution: centsToDollars(
        circleRule.minimumMonthlyContributionCents,
      ),
      minimumMonthlyContributionFormatted: formatUsdFromCents(
        circleRule.minimumMonthlyContributionCents,
      ),
      minimumReserveBalance: centsToDollars(
        circleRule.minimumReserveBalanceCents,
      ),
      minimumReserveBalanceFormatted: formatUsdFromCents(
        circleRule.minimumReserveBalanceCents,
      ),
      minimumMembershipDurationMonths:
        circleRule.minimumMembershipDurationMonths ?? null,
      maxActiveLoansPerMember: circleRule.maxActiveLoansPerMember ?? null,
      maxRepaymentTermMonths: circleRule.maxRepaymentTermMonths ?? null,
      memberCount: members.length,
    },
    viewerMembership: {
      membershipId: viewerMembership.id,
      role: viewerMembership.role,
      status: viewerMembership.status,
    },
    members,
  };
}
