import { beforeEach, describe, expect, it, vi } from "vitest";

import { POST } from "@/app/api/v1/circles/route";

const { createCircleWithOwner, setSessionCookie } = vi.hoisted(() => ({
  createCircleWithOwner: vi.fn(),
  setSessionCookie: vi.fn(),
}));

vi.mock("@/server/services/circle-onboarding-service", () => ({
  createCircleWithOwner,
}));

vi.mock("@/lib/session", () => ({
  setSessionCookie,
}));

describe("POST /api/v1/circles", () => {
  beforeEach(() => {
    createCircleWithOwner.mockReset();
    setSessionCookie.mockReset();
  });

  it("returns 201 with a redirect target when creation succeeds", async () => {
    createCircleWithOwner.mockResolvedValue({
      userId: "user_123",
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
          user: {
            name: "Amina Yusuf",
            email: "amina@example.com",
          },
          circle: {
            name: "North Hill Community Circle",
            contributionAmount: 250,
            contributionFrequency: "MONTHLY",
            maxLoanSize: 1000,
            approvalMode: "ADMIN_ONLY",
          },
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
    expect(setSessionCookie).toHaveBeenCalledTimes(1);
  });

  it("returns 400 when the payload is invalid", async () => {
    const response = await POST(
      new Request("http://localhost/api/v1/circles", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          user: {
            name: "",
            email: "not-an-email",
          },
          circle: {
            name: "",
            contributionAmount: 0,
            contributionFrequency: "MONTHLY",
            maxLoanSize: 0,
            approvalMode: "ADMIN_ONLY",
          },
        }),
      }),
    );

    expect(response.status).toBe(400);
    expect(createCircleWithOwner).not.toHaveBeenCalled();
  });
});
