import { NextResponse } from "next/server";

import {
  createErrorResponse,
  createValidationErrorResponse,
  parseJsonBody,
} from "@/lib/api";
import { setSessionCookie } from "@/lib/session";
import { createCircleRequestSchema } from "@/lib/validations/circles";
import { createCircleWithOwner } from "@/server/services/circle-onboarding-service";

export async function POST(request: Request) {
  try {
    const payload = await parseJsonBody(request);
    const parsedPayload = createCircleRequestSchema.safeParse(payload);

    if (!parsedPayload.success) {
      return createValidationErrorResponse(parsedPayload.error);
    }

    const result = await createCircleWithOwner(parsedPayload.data);
    const response = NextResponse.json(
      {
        circle: result.circle,
        redirectTo: result.redirectTo,
      },
      { status: 201 },
    );

    setSessionCookie(response, result.userId);

    return response;
  } catch (error) {
    return createErrorResponse(error);
  }
}
