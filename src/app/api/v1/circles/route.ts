import { NextResponse } from "next/server";

import {
  createErrorResponse,
  createValidationErrorResponse,
  parseJsonBody,
} from "@/lib/api";
import { getSessionUserId } from "@/lib/session";
import { createCircleRequestSchema } from "@/lib/validations/circles";
import { createCircleForUser } from "@/server/services/circle-onboarding-service";
import { ServiceError } from "@/server/services/service-error";

export async function POST(request: Request) {
  try {
    const userId = await getSessionUserId();

    if (!userId) {
      throw new ServiceError(403, "AUTH_REQUIRED", "You need an active session.");
    }

    const payload = await parseJsonBody(request);
    const parsedPayload = createCircleRequestSchema.safeParse(payload);

    if (!parsedPayload.success) {
      return createValidationErrorResponse(parsedPayload.error);
    }

    const result = await createCircleForUser(userId, parsedPayload.data);

    return NextResponse.json(
      {
        circle: result.circle,
        redirectTo: result.redirectTo,
      },
      { status: 201 },
    );
  } catch (error) {
    return createErrorResponse(error);
  }
}
