import { randomInt } from "node:crypto";

import { Prisma } from "@/generated/prisma/client";
import { MembershipRole, MembershipStatus } from "@/generated/prisma/client";
import type { CircleRedirectResponse } from "@/lib/api-types";
import { dollarsToCents } from "@/lib/money";
import type { CreateCircleRequest } from "@/lib/validations/circles";
import { prisma } from "@/lib/prisma";
import {
  createCircle,
  createCircleRule,
  createMembership,
  findCircleByInviteCode,
  findMembershipForCircleUser,
} from "@/server/data/circle-repository";
import { ServiceError } from "@/server/services/service-error";

const INVITE_CODE_ALPHABET = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
const MAX_INVITE_CODE_ATTEMPTS = 6;

function normalizeInviteCode(inviteCode: string) {
  return inviteCode.trim().toUpperCase();
}

function generateInviteCode() {
  return Array.from({ length: 8 }, () => {
    const randomIndex = randomInt(INVITE_CODE_ALPHABET.length);
    return INVITE_CODE_ALPHABET[randomIndex];
  }).join("");
}

function isInviteCodeConflict(error: unknown) {
  if (!(error instanceof Prisma.PrismaClientKnownRequestError)) {
    return false;
  }

  if (error.code !== "P2002") {
    return false;
  }

  const target = error.meta?.target;

  if (Array.isArray(target)) {
    return target.includes("inviteCode");
  }

  return target === "inviteCode";
}

type CreateCircleInput = CreateCircleRequest;

function normalizeCircleInviteCode(inviteCode: string) {
  return normalizeInviteCode(inviteCode);
}

async function joinCircleForResolvedUser(userId: string, inviteCode: string) {
  return prisma.$transaction(async (tx) => {
    const circle = await findCircleByInviteCode(tx, normalizeCircleInviteCode(inviteCode));

    if (!circle) {
      throw new ServiceError(404, "INVITE_CODE_NOT_FOUND", "Invite code not found.");
    }

    const existingMembership = await findMembershipForCircleUser(tx, circle.id, userId);

    if (existingMembership?.status === MembershipStatus.SUSPENDED) {
      throw new ServiceError(
        403,
        "MEMBERSHIP_SUSPENDED",
        "This membership is suspended and cannot join the circle.",
      );
    }

    if (!existingMembership) {
      await createMembership(tx, {
        circleId: circle.id,
        userId,
        role: MembershipRole.MEMBER,
        status: MembershipStatus.ACTIVE,
      });
    }

    return {
      circle,
      redirectTo: `/circles/${circle.id}`,
    };
  });
}

export async function createCircleForUser(
  userId: string,
  input: CreateCircleInput,
): Promise<CircleRedirectResponse> {
  for (let attempt = 0; attempt < MAX_INVITE_CODE_ATTEMPTS; attempt += 1) {
    try {
      return await prisma.$transaction(async (tx) => {
        const circle = await createCircle(tx, {
          name: input.name.trim(),
          inviteCode: generateInviteCode(),
          createdById: userId,
        });

        await createCircleRule(tx, {
          circleId: circle.id,
          approvalMode: input.approvalMode,
          minimumMonthlyContributionCents: dollarsToCents(
            input.minimumMonthlyContribution,
          ),
          minimumReserveBalanceCents: dollarsToCents(input.minimumReserveBalance),
          minimumMembershipDurationMonths: input.minimumMembershipDurationMonths,
          maxActiveLoansPerMember: input.maxActiveLoansPerMember,
          maxRepaymentTermMonths: input.maxRepaymentTermMonths,
        });

        await createMembership(tx, {
          circleId: circle.id,
          userId,
          role: MembershipRole.ADMIN,
          status: MembershipStatus.ACTIVE,
        });

        return {
          circle,
          redirectTo: `/circles/${circle.id}`,
        };
      });
    } catch (error) {
      if (isInviteCodeConflict(error) && attempt < MAX_INVITE_CODE_ATTEMPTS - 1) {
        continue;
      }

      throw error;
    }
  }

  throw new ServiceError(
    500,
    "INVITE_CODE_GENERATION_FAILED",
    "Unable to create a unique invite code for this circle.",
  );
}

export async function joinCircleByInviteCodeForUser(
  userId: string,
  inviteCode: string,
): Promise<CircleRedirectResponse> {
  return joinCircleForResolvedUser(userId, inviteCode);
}
