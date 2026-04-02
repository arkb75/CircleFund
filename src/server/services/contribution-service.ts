import {
  MembershipRole,
  MembershipStatus,
} from "@/generated/prisma/client";
import type {
  ContributionCreateResponse,
  ContributionHistoryResponse,
} from "@/lib/api-types";
import {
  formatDateOnly,
  getContributionPeriodStart,
  parseDateOnlyString,
} from "@/lib/contribution-periods";
import { dollarsToCents, centsToDollars, formatUsdFromCents } from "@/lib/money";
import { prisma } from "@/lib/prisma";
import type {
  CreateContributionRequest,
  ContributionHistoryQuery,
} from "@/lib/validations/contributions";
import {
  createContribution,
  findCircleMembershipById,
  findContributionHistoryForMembership,
  findMembershipForCircleUser,
} from "@/server/data/circle-repository";
import { buildContributionHistoryPeriods } from "@/server/services/contribution-analytics";
import { ServiceError } from "@/server/services/service-error";

export async function createContributionForCircle(
  circleId: string,
  userId: string,
  input: CreateContributionRequest,
): Promise<ContributionCreateResponse> {
  const contributedOn = parseDateOnlyString(input.contributedOn);

  if (!contributedOn) {
    throw new ServiceError(
      400,
      "INVALID_CONTRIBUTION_DATE",
      "Contribution date must be valid.",
    );
  }

  return prisma.$transaction(async (tx) => {
    const viewerMembership = await findMembershipForCircleUser(tx, circleId, userId);

    if (!viewerMembership || viewerMembership.status !== MembershipStatus.ACTIVE) {
      throw new ServiceError(
        403,
        "CIRCLE_ACCESS_DENIED",
        "You do not have access to this circle.",
      );
    }

    const targetMembership = await findCircleMembershipById(
      tx,
      circleId,
      input.membershipId,
    );

    if (!targetMembership) {
      throw new ServiceError(
        404,
        "CONTRIBUTION_TARGET_NOT_FOUND",
        "Member not found for this circle.",
      );
    }

    if (targetMembership.status !== MembershipStatus.ACTIVE) {
      throw new ServiceError(
        400,
        "CONTRIBUTION_TARGET_INACTIVE",
        "Only active members can receive contributions.",
      );
    }

    if (
      viewerMembership.role !== MembershipRole.ADMIN &&
      viewerMembership.id !== targetMembership.id
    ) {
      throw new ServiceError(
        403,
        "CONTRIBUTION_LOG_FORBIDDEN",
        "You can only log contributions for your own membership.",
      );
    }

    const contribution = await createContribution(tx, {
      circleId,
      membershipId: targetMembership.id,
      recordedByUserId: userId,
      amountCents: dollarsToCents(input.amount),
      contributedOn,
      periodStart: getContributionPeriodStart(contributedOn),
    });

    return {
      contribution: {
        id: contribution.id,
        membershipId: contribution.membershipId,
        amount: centsToDollars(contribution.amountCents),
        amountFormatted: formatUsdFromCents(contribution.amountCents),
        contributedOn: formatDateOnly(contribution.contributedOn),
        periodStart: formatDateOnly(contribution.periodStart),
        createdAt: contribution.createdAt.toISOString(),
      },
    };
  });
}

export async function getContributionHistoryForCircle(
  circleId: string,
  userId: string,
  input: ContributionHistoryQuery,
): Promise<ContributionHistoryResponse> {
  const viewerMembership = await findMembershipForCircleUser(prisma, circleId, userId);

  if (!viewerMembership || viewerMembership.status !== MembershipStatus.ACTIVE) {
    throw new ServiceError(
      403,
      "CIRCLE_ACCESS_DENIED",
      "You do not have access to this circle.",
    );
  }

  const targetMembership = await findCircleMembershipById(
    prisma,
    circleId,
    input.membershipId,
  );

  if (!targetMembership || !targetMembership.circle.rule) {
    throw new ServiceError(
      404,
      "CONTRIBUTION_TARGET_NOT_FOUND",
      "Member not found for this circle.",
    );
  }

  const contributions = await findContributionHistoryForMembership(
    prisma,
    circleId,
    targetMembership.id,
  );

  return {
    member: {
      membershipId: targetMembership.id,
      id: targetMembership.user.id,
      name: targetMembership.user.name,
      email: targetMembership.user.email,
      role: targetMembership.role,
      status: targetMembership.status,
    },
    periods: buildContributionHistoryPeriods(
      targetMembership.circle.rule.minimumMonthlyContributionCents,
      contributions,
    ),
  };
}
