import {
  MembershipRole,
  MembershipStatus,
} from "@/generated/prisma/client";
import type { CircleDashboardResponse } from "@/lib/api-types";
import { centsToDollars, formatUsdFromCents } from "@/lib/money";
import { prisma } from "@/lib/prisma";
import {
  findCircleDashboard,
  findLatestMembershipForUser,
} from "@/server/data/circle-repository";
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
  const circle = await findCircleDashboard(prisma, circleId);

  if (!circle || !circle.rule) {
    throw new ServiceError(404, "CIRCLE_NOT_FOUND", "Circle not found.");
  }

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
    .map((membership) => ({
      id: membership.user.id,
      name: membership.user.name,
      email: membership.user.email,
      role: membership.role,
      status: membership.status,
      joinedAt: membership.createdAt.toISOString(),
    }));

  return {
    circle: {
      id: circle.id,
      name: circle.name,
      inviteCode: circle.inviteCode,
      approvalMode: circle.rule.approvalMode,
      minimumMonthlyContribution: centsToDollars(
        circle.rule.minimumMonthlyContributionCents,
      ),
      minimumMonthlyContributionFormatted: formatUsdFromCents(
        circle.rule.minimumMonthlyContributionCents,
      ),
      minimumReserveBalance: centsToDollars(
        circle.rule.minimumReserveBalanceCents,
      ),
      minimumReserveBalanceFormatted: formatUsdFromCents(
        circle.rule.minimumReserveBalanceCents,
      ),
      minimumMembershipDurationMonths:
        circle.rule.minimumMembershipDurationMonths ?? null,
      maxActiveLoansPerMember: circle.rule.maxActiveLoansPerMember ?? null,
      maxRepaymentTermMonths: circle.rule.maxRepaymentTermMonths ?? null,
      memberCount: members.length,
    },
    viewerMembership: {
      role: viewerMembership.role,
      status: viewerMembership.status,
    },
    members,
  };
}
