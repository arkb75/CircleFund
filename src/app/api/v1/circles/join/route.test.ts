import { beforeEach, describe, expect, it, vi } from "vitest";

import { POST } from "@/app/api/v1/circles/join/route";
import { ServiceError } from "@/server/services/service-error";

const { joinCircleByInviteCodeForUser, getSessionUserId } = vi.hoisted(() => ({
  joinCircleByInviteCodeForUser: vi.fn(),
  getSessionUserId: vi.fn(),
}));

vi.mock("@/server/services/circle-onboarding-service", () => ({
  joinCircleByInviteCodeForUser,
}));

vi.mock("@/lib/session", () => ({
  getSessionUserId,
}));

describe("POST /api/v1/circles/join", () => {
  beforeEach(() => {
    joinCircleByInviteCodeForUser.mockReset();
    getSessionUserId.mockReset();
  });

  it("returns 403 when no session is present", async () => {
    getSessionUserId.mockResolvedValue(null);

    const response = await POST(
      new Request("http://localhost/api/v1/circles/join", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          inviteCode: "AB8K2Q9L",
        }),
      }),
    );

    expect(response.status).toBe(403);
  });

  it("returns the joined circle payload when the invite code is valid", async () => {
    getSessionUserId.mockResolvedValue("user_234");
    joinCircleByInviteCodeForUser.mockResolvedValue({
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
    expect(joinCircleByInviteCodeForUser).toHaveBeenCalledWith(
      "user_234",
      "AB8K2Q9L",
    );
  });

  it("returns 404 when the invite code is invalid", async () => {
    getSessionUserId.mockResolvedValue("user_234");
    joinCircleByInviteCodeForUser.mockRejectedValue(
      new ServiceError(404, "INVITE_CODE_NOT_FOUND", "Invite code not found."),
    );

    const response = await POST(
      new Request("http://localhost/api/v1/circles/join", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
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
