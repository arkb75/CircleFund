import { NextResponse } from "next/server";
import { ZodError } from "zod";

import { ServiceError, isServiceError } from "@/server/services/service-error";

export async function parseJsonBody(request: Request) {
  try {
    return await request.json();
  } catch {
    throw new ServiceError(400, "INVALID_JSON", "Request body must be valid JSON.");
  }
}

export function createValidationErrorResponse(error: ZodError) {
  return NextResponse.json(
    {
      error: {
        code: "VALIDATION_ERROR",
        message: "Please review the request payload and try again.",
        fields: error.flatten().fieldErrors,
      },
    },
    { status: 400 },
  );
}

export function createErrorResponse(error: unknown) {
  if (isServiceError(error)) {
    return NextResponse.json(
      {
        error: {
          code: error.code,
          message: error.message,
        },
      },
      { status: error.status },
    );
  }

  console.error(error);

  return NextResponse.json(
    {
      error: {
        code: "INTERNAL_SERVER_ERROR",
        message: "Something went wrong. Please try again.",
      },
    },
    { status: 500 },
  );
}
