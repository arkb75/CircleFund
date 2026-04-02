import { beforeEach, describe, expect, it, vi } from "vitest";

import {
  GET,
  POST,
} from "@/app/api/v1/circles/[circleId]/contributions/route";
import { ServiceError } from "@/server/services/service-error";

const { getSessionUserId, createContributionForCircle, getContributionHistoryForCircle } =
  vi.hoisted(() => ({
    getSessionUserId: vi.fn(),
    createContributionForCircle: vi.fn(),
    getContributionHistoryForCircle: vi.fn(),
  }));

vi.mock("@/lib/session", () => ({
  getSessionUserId,
}));

vi.mock("@/server/services/contribution-service", () => ({
  createContributionForCircle,
  getContributionHistoryForCircle,
}));

describe("Contribution routes", () => {
  beforeEach(() => {
    getSessionUserId.mockReset();
    createContributionForCircle.mockReset();
    getContributionHistoryForCircle.mockReset();
  });

  it("returns 403 when creating without a session", async () => {
    getSessionUserId.mockResolvedValue(null);

    const response = await POST(
      new Request("http://localhost/api/v1/circles/circle_123/contributions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          membershipId: "membership_123",
          amount: 75,
          contributedOn: "2026-04-02",
        }),
      }),
      {
        params: Promise.resolve({ circleId: "circle_123" }),
      },
    );

    expect(response.status).toBe(403);
  });

  it("creates a contribution for a valid request", async () => {
    getSessionUserId.mockResolvedValue("user_123");
    createContributionForCircle.mockResolvedValue({
      contribution: {
        id: "contribution_123",
        membershipId: "membership_123",
        amount: 75,
        amountFormatted: "$75.00",
        contributedOn: "2026-04-02",
        periodStart: "2026-04-01",
        createdAt: "2026-04-02T16:00:00.000Z",
      },
    });

    const response = await POST(
      new Request("http://localhost/api/v1/circles/circle_123/contributions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          membershipId: "membership_123",
          amount: 75,
          contributedOn: "2026-04-02",
        }),
      }),
      {
        params: Promise.resolve({ circleId: "circle_123" }),
      },
    );

    expect(response.status).toBe(201);
    expect(createContributionForCircle).toHaveBeenCalledWith("circle_123", "user_123", {
      membershipId: "membership_123",
      amount: 75,
      contributedOn: "2026-04-02",
    });
  });

  it("returns 400 for invalid create payloads", async () => {
    getSessionUserId.mockResolvedValue("user_123");

    const response = await POST(
      new Request("http://localhost/api/v1/circles/circle_123/contributions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          membershipId: "",
          amount: 0,
          contributedOn: "not-a-date",
        }),
      }),
      {
        params: Promise.resolve({ circleId: "circle_123" }),
      },
    );

    expect(response.status).toBe(400);
    expect(createContributionForCircle).not.toHaveBeenCalled();
  });

  it("returns service errors from create", async () => {
    getSessionUserId.mockResolvedValue("user_123");
    createContributionForCircle.mockRejectedValue(
      new ServiceError(
        403,
        "CONTRIBUTION_LOG_FORBIDDEN",
        "You can only log contributions for your own membership.",
      ),
    );

    const response = await POST(
      new Request("http://localhost/api/v1/circles/circle_123/contributions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          membershipId: "membership_999",
          amount: 75,
          contributedOn: "2026-04-02",
        }),
      }),
      {
        params: Promise.resolve({ circleId: "circle_123" }),
      },
    );

    expect(response.status).toBe(403);
  });

  it("returns 403 when reading history without a session", async () => {
    getSessionUserId.mockResolvedValue(null);

    const response = await GET(
      new Request(
        "http://localhost/api/v1/circles/circle_123/contributions?membershipId=membership_123",
      ),
      {
        params: Promise.resolve({ circleId: "circle_123" }),
      },
    );

    expect(response.status).toBe(403);
  });

  it("returns member history for a valid query", async () => {
    getSessionUserId.mockResolvedValue("user_123");
    getContributionHistoryForCircle.mockResolvedValue({
      member: {
        membershipId: "membership_123",
        id: "user_123",
        name: "Amina Yusuf",
        email: "amina@example.com",
        role: "ADMIN",
        status: "ACTIVE",
      },
      periods: [],
    });

    const response = await GET(
      new Request(
        "http://localhost/api/v1/circles/circle_123/contributions?membershipId=membership_123",
      ),
      {
        params: Promise.resolve({ circleId: "circle_123" }),
      },
    );

    expect(response.status).toBe(200);
    expect(getContributionHistoryForCircle).toHaveBeenCalledWith(
      "circle_123",
      "user_123",
      {
        membershipId: "membership_123",
      },
    );
  });

  it("returns 400 when membershipId is missing from history requests", async () => {
    getSessionUserId.mockResolvedValue("user_123");

    const response = await GET(
      new Request("http://localhost/api/v1/circles/circle_123/contributions"),
      {
        params: Promise.resolve({ circleId: "circle_123" }),
      },
    );

    expect(response.status).toBe(400);
    expect(getContributionHistoryForCircle).not.toHaveBeenCalled();
  });
});
