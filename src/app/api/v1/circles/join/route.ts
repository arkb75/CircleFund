import { NextResponse } from "next/server";

import {
  createErrorResponse,
  createValidationErrorResponse,
  parseJsonBody,
} from "@/lib/api";
import { setSessionCookie } from "@/lib/session";
import { joinCircleRequestSchema } from "@/lib/validations/circles";
import { joinCircleByInviteCode } from "@/server/services/circle-onboarding-service";

export async function POST(request: Request) {
  try {
    const payload = await parseJsonBody(request);
    const parsedPayload = joinCircleRequestSchema.safeParse(payload);

    if (!parsedPayload.success) {
      return createValidationErrorResponse(parsedPayload.error);
    }

    const result = await joinCircleByInviteCode(parsedPayload.data);
    const response = NextResponse.json({
      circle: result.circle,
      redirectTo: result.redirectTo,
    });

    setSessionCookie(response, result.userId);

    return response;
  } catch (error) {
    return createErrorResponse(error);
  }
}
