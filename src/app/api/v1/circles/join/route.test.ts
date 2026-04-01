import { beforeEach, describe, expect, it, vi } from "vitest";

import { POST } from "@/app/api/v1/circles/join/route";
import { ServiceError } from "@/server/services/service-error";

const { joinCircleByInviteCode, setSessionCookie } = vi.hoisted(() => ({
  joinCircleByInviteCode: vi.fn(),
  setSessionCookie: vi.fn(),
}));

vi.mock("@/server/services/circle-onboarding-service", () => ({
  joinCircleByInviteCode,
}));

vi.mock("@/lib/session", () => ({
  setSessionCookie,
}));

describe("POST /api/v1/circles/join", () => {
  beforeEach(() => {
    joinCircleByInviteCode.mockReset();
    setSessionCookie.mockReset();
  });

  it("returns the joined circle payload when the invite code is valid", async () => {
    joinCircleByInviteCode.mockResolvedValue({
      userId: "user_234",
      circle: {
        id: "circle_123",
        name: "North Hill Community Circle",
        inviteCode: "AB8K2Q9L",
      },
      redirectTo: "/circles/circle_123",
    });

    const response = await POST(
      new Request("http://localhost/api/v1/circles/join", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          user: {
            name: "Kwame Adebayo",
            email: "kwame@example.com",
          },
          inviteCode: "AB8K2Q9L",
        }),
      }),
    );

    expect(response.status).toBe(200);
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

  it("returns 404 when the invite code is invalid", async () => {
    joinCircleByInviteCode.mockRejectedValue(
      new ServiceError(404, "INVITE_CODE_NOT_FOUND", "Invite code not found."),
    );

    const response = await POST(
      new Request("http://localhost/api/v1/circles/join", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          user: {
            name: "Kwame Adebayo",
            email: "kwame@example.com",
          },
          inviteCode: "WRONGCODE",
        }),
      }),
    );

    expect(response.status).toBe(404);
    expect(await response.json()).toEqual({
      error: {
        code: "INVITE_CODE_NOT_FOUND",
        message: "Invite code not found.",
      },
    });
  });
});
