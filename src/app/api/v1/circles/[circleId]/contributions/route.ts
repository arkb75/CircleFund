import { NextResponse } from "next/server";

import {
  createErrorResponse,
  createValidationErrorResponse,
  parseJsonBody,
} from "@/lib/api";
import { getSessionUserId } from "@/lib/session";
import {
  contributionHistoryQuerySchema,
  createContributionRequestSchema,
} from "@/lib/validations/contributions";
import {
  createContributionForCircle,
  getContributionHistoryForCircle,
} from "@/server/services/contribution-service";
import { ServiceError } from "@/server/services/service-error";

type RouteContext = {
  params: Promise<{
    circleId: string;
  }>;
};

export async function POST(request: Request, context: RouteContext) {
  try {
    const userId = await getSessionUserId();

    if (!userId) {
      throw new ServiceError(403, "AUTH_REQUIRED", "You need an active session.");
    }

    const payload = await parseJsonBody(request);
    const parsedPayload = createContributionRequestSchema.safeParse(payload);

    if (!parsedPayload.success) {
      return createValidationErrorResponse(parsedPayload.error);
    }

    const { circleId } = await context.params;
    const result = await createContributionForCircle(circleId, userId, parsedPayload.data);

    return NextResponse.json(result, { status: 201 });
  } catch (error) {
    return createErrorResponse(error);
  }
}

export async function GET(request: Request, context: RouteContext) {
  try {
    const userId = await getSessionUserId();

    if (!userId) {
      throw new ServiceError(403, "AUTH_REQUIRED", "You need an active session.");
    }

    const searchParams = new URL(request.url).searchParams;
    const parsedQuery = contributionHistoryQuerySchema.safeParse({
      membershipId: searchParams.get("membershipId") ?? "",
    });

    if (!parsedQuery.success) {
      return createValidationErrorResponse(parsedQuery.error);
    }

    const { circleId } = await context.params;
    const result = await getContributionHistoryForCircle(circleId, userId, parsedQuery.data);

    return NextResponse.json(result);
  } catch (error) {
    return createErrorResponse(error);
  }
}
