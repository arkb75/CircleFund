import { NextResponse } from "next/server";

import {
  createErrorResponse,
  createValidationErrorResponse,
  parseJsonBody,
} from "@/lib/api";
import { setSessionCookie } from "@/lib/session";
import { signUpRequestSchema } from "@/lib/validations/auth";
import { signUpAccount } from "@/server/services/auth-service";

export async function POST(request: Request) {
  try {
    const payload = await parseJsonBody(request);
    const parsedPayload = signUpRequestSchema.safeParse(payload);

    if (!parsedPayload.success) {
      return createValidationErrorResponse(parsedPayload.error);
    }

    const result = await signUpAccount(parsedPayload.data);
    const response = NextResponse.json(
      {
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
