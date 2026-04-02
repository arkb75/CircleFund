import { beforeEach, describe, expect, it, vi } from "vitest";

import { POST } from "@/app/api/v1/circles/route";

const { createCircleForUser, getSessionUserId } = vi.hoisted(() => ({
  createCircleForUser: vi.fn(),
  getSessionUserId: vi.fn(),
}));

vi.mock("@/server/services/circle-onboarding-service", () => ({
  createCircleForUser,
}));

vi.mock("@/lib/session", () => ({
  getSessionUserId,
}));

describe("POST /api/v1/circles", () => {
  beforeEach(() => {
    createCircleForUser.mockReset();
    getSessionUserId.mockReset();
  });

  it("returns 403 when no session is present", async () => {
    getSessionUserId.mockResolvedValue(null);

    const response = await POST(
      new Request("http://localhost/api/v1/circles", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: "North Hill Community Circle",
          contributionAmount: 250,
          contributionFrequency: "MONTHLY",
          maxLoanSize: 1000,
          approvalMode: "ADMIN_ONLY",
        }),
      }),
    );

    expect(response.status).toBe(403);
  });

  it("returns 201 with a redirect target when creation succeeds", async () => {
    getSessionUserId.mockResolvedValue("user_123");
    createCircleForUser.mockResolvedValue({
      circle: {
        id: "circle_123",
        name: "North Hill Community Circle",
        inviteCode: "AB8K2Q9L",
      },
      redirectTo: "/circles/circle_123",
    });

    const response = await POST(
      new Request("http://localhost/api/v1/circles", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: "North Hill Community Circle",
          contributionAmount: 250,
          contributionFrequency: "MONTHLY",
          maxLoanSize: 1000,
          approvalMode: "ADMIN_ONLY",
        }),
      }),
    );

    expect(response.status).toBe(201);
    expect(await response.json()).toEqual({
      circle: {
        id: "circle_123",
        name: "North Hill Community Circle",
        inviteCode: "AB8K2Q9L",
      },
      redirectTo: "/circles/circle_123",
    });
    expect(createCircleForUser).toHaveBeenCalledWith("user_123", {
      name: "North Hill Community Circle",
      contributionAmount: 250,
      contributionFrequency: "MONTHLY",
      maxLoanSize: 1000,
      approvalMode: "ADMIN_ONLY",
    });
  });

  it("returns 400 when the payload is invalid", async () => {
    getSessionUserId.mockResolvedValue("user_123");

    const response = await POST(
      new Request("http://localhost/api/v1/circles", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: "",
          contributionAmount: 0,
          contributionFrequency: "MONTHLY",
          maxLoanSize: 0,
          approvalMode: "ADMIN_ONLY",
        }),
      }),
    );

    expect(response.status).toBe(400);
    expect(createCircleForUser).not.toHaveBeenCalled();
  });
});
