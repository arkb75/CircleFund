import type { AuthRedirectResponse } from "@/lib/api-types";
import type { LoginRequest, SignUpRequest } from "@/lib/validations/auth";
import { prisma } from "@/lib/prisma";
import {
  findCircleByInviteCode,
  findLatestMembershipForUser,
  findUserByEmail,
  upsertUser,
} from "@/server/data/circle-repository";
import { joinCircleByInviteCodeForUser } from "@/server/services/circle-onboarding-service";
import { ServiceError } from "@/server/services/service-error";

function normalizeEmail(email: string) {
  return email.trim().toLowerCase();
}

function resolveRedirect(circleId: string | null) {
  return circleId ? `/circles/${circleId}` : "/onboarding";
}

export async function signUpAccount(
  input: SignUpRequest,
): Promise<AuthRedirectResponse & { userId: string }> {
  const email = normalizeEmail(input.email);

  if (input.inviteCode?.trim()) {
    const existingCircle = await findCircleByInviteCode(
      prisma,
      input.inviteCode.trim().toUpperCase(),
    );

    if (!existingCircle) {
      throw new ServiceError(404, "INVITE_CODE_NOT_FOUND", "Invite code not found.");
    }
  }

  const user = await upsertUser(prisma, {
    name: input.name.trim(),
    email,
  });

  if (input.inviteCode?.trim()) {
    const joinResult = await joinCircleByInviteCodeForUser(user.id, input.inviteCode);

    return {
      userId: user.id,
      redirectTo: joinResult.redirectTo,
    };
  }

  return {
    userId: user.id,
    redirectTo: "/onboarding",
  };
}

export async function signInAccount(
  input: LoginRequest,
): Promise<AuthRedirectResponse & { userId: string }> {
  const user = await findUserByEmail(prisma, normalizeEmail(input.email));

  if (!user) {
    throw new ServiceError(
      404,
      "ACCOUNT_NOT_FOUND",
      "No account exists for that email yet. Create one first.",
    );
  }

  const latestMembership = await findLatestMembershipForUser(prisma, user.id);
  const redirectTo =
    latestMembership && latestMembership.status !== "SUSPENDED"
      ? resolveRedirect(latestMembership.circleId)
      : "/onboarding";

  return {
    userId: user.id,
    redirectTo,
  };
}
