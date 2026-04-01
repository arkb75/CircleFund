import { NextResponse } from "next/server";

import { createErrorResponse } from "@/lib/api";
import { getSessionUserId } from "@/lib/session";
import { getCircleDashboardForUser } from "@/server/services/circle-dashboard-service";
import { ServiceError } from "@/server/services/service-error";

type RouteContext = {
  params: Promise<{
    circleId: string;
  }>;
};

export async function GET(_request: Request, context: RouteContext) {
  try {
    const userId = await getSessionUserId();

    if (!userId) {
      throw new ServiceError(403, "AUTH_REQUIRED", "You need an active session.");
    }

    const { circleId } = await context.params;
    const dashboard = await getCircleDashboardForUser(circleId, userId);

    return NextResponse.json(dashboard);
  } catch (error) {
    return createErrorResponse(error);
  }
}
