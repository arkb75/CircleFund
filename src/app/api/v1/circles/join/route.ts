import { NextResponse } from "next/server";

import {
  createErrorResponse,
  createValidationErrorResponse,
  parseJsonBody,
} from "@/lib/api";
import { getSessionUserId } from "@/lib/session";
import { joinCircleRequestSchema } from "@/lib/validations/circles";
import { joinCircleByInviteCodeForUser } from "@/server/services/circle-onboarding-service";
import { ServiceError } from "@/server/services/service-error";

export async function POST(request: Request) {
  try {
    const userId = await getSessionUserId();

    if (!userId) {
      throw new ServiceError(403, "AUTH_REQUIRED", "You need an active session.");
    }

    const payload = await parseJsonBody(request);
    const parsedPayload = joinCircleRequestSchema.safeParse(payload);

    if (!parsedPayload.success) {
      return createValidationErrorResponse(parsedPayload.error);
    }

    const result = await joinCircleByInviteCodeForUser(
      userId,
      parsedPayload.data.inviteCode,
    );

    return NextResponse.json({
      circle: result.circle,
      redirectTo: result.redirectTo,
    });
  } catch (error) {
    return createErrorResponse(error);
  }
}
