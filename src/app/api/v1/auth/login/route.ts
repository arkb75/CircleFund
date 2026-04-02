import { NextResponse } from "next/server";

import {
  createErrorResponse,
  createValidationErrorResponse,
  parseJsonBody,
} from "@/lib/api";
import { setSessionCookie } from "@/lib/session";
import { loginRequestSchema } from "@/lib/validations/auth";
import { signInAccount } from "@/server/services/auth-service";

export async function POST(request: Request) {
  try {
    const payload = await parseJsonBody(request);
    const parsedPayload = loginRequestSchema.safeParse(payload);

    if (!parsedPayload.success) {
      return createValidationErrorResponse(parsedPayload.error);
    }

    const result = await signInAccount(parsedPayload.data);
    const response = NextResponse.json({
      redirectTo: result.redirectTo,
    });

    setSessionCookie(response, result.userId);

    return response;
  } catch (error) {
    return createErrorResponse(error);
  }
}
