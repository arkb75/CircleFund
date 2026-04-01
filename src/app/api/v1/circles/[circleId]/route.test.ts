import { beforeEach, describe, expect, it, vi } from "vitest";

import { GET } from "@/app/api/v1/circles/[circleId]/route";

const { getSessionUserId, getCircleDashboardForUser } = vi.hoisted(() => ({
  getSessionUserId: vi.fn(),
  getCircleDashboardForUser: vi.fn(),
}));

vi.mock("@/lib/session", () => ({
  getSessionUserId,
}));

vi.mock("@/server/services/circle-dashboard-service", () => ({
  getCircleDashboardForUser,
}));

describe("GET /api/v1/circles/[circleId]", () => {
  beforeEach(() => {
    getSessionUserId.mockReset();
    getCircleDashboardForUser.mockReset();
  });

  it("returns 403 when no session is present", async () => {
    getSessionUserId.mockResolvedValue(null);

    const response = await GET(new Request("http://localhost"), {
      params: Promise.resolve({ circleId: "circle_123" }),
    });

    expect(response.status).toBe(403);
    expect(await response.json()).toEqual({
      error: {
        code: "AUTH_REQUIRED",
        message: "You need an active session.",
      },
    });
  });

  it("returns the dashboard payload for an authorized member", async () => {
    getSessionUserId.mockResolvedValue("user_123");
    getCircleDashboardForUser.mockResolvedValue({
      circle: {
        id: "circle_123",
        name: "North Hill Community Circle",
        inviteCode: "AB8K2Q9L",
        contributionAmount: 250,
        contributionAmountFormatted: "$250.00",
        contributionFrequency: "MONTHLY",
        maxLoanSize: 1000,
        maxLoanSizeFormatted: "$1,000.00",
        approvalMode: "ADMIN_ONLY",
        memberCount: 2,
      },
      viewerMembership: {
        role: "ADMIN",
        status: "ACTIVE",
      },
      members: [
        {
          id: "user_123",
          name: "Amina Yusuf",
          email: "amina@example.com",
          role: "ADMIN",
          status: "ACTIVE",
          joinedAt: "2026-04-01T00:00:00.000Z",
        },
      ],
    });

    const response = await GET(new Request("http://localhost"), {
      params: Promise.resolve({ circleId: "circle_123" }),
    });

    expect(response.status).toBe(200);
    expect(await response.json()).toMatchObject({
      circle: {
        id: "circle_123",
        name: "North Hill Community Circle",
      },
      viewerMembership: {
        role: "ADMIN",
      },
    });
    expect(getCircleDashboardForUser).toHaveBeenCalledWith("circle_123", "user_123");
  });
});
