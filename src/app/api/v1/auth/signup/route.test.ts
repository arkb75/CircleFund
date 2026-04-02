import { beforeEach, describe, expect, it, vi } from "vitest";

import { POST } from "@/app/api/v1/auth/signup/route";

const { signUpAccount, setSessionCookie } = vi.hoisted(() => ({
  signUpAccount: vi.fn(),
  setSessionCookie: vi.fn(),
}));

vi.mock("@/server/services/auth-service", () => ({
  signUpAccount,
}));

vi.mock("@/lib/session", () => ({
  setSessionCookie,
}));

describe("POST /api/v1/auth/signup", () => {
  beforeEach(() => {
    signUpAccount.mockReset();
    setSessionCookie.mockReset();
  });

  it("creates the account and returns the next onboarding redirect", async () => {
    signUpAccount.mockResolvedValue({
      userId: "user_123",
      redirectTo: "/onboarding",
    });

    const response = await POST(
      new Request("http://localhost/api/v1/auth/signup", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: "Amina Yusuf",
          email: "amina@example.com",
          inviteCode: "",
        }),
      }),
    );

    expect(response.status).toBe(201);
    expect(await response.json()).toEqual({
      redirectTo: "/onboarding",
    });
    expect(setSessionCookie).toHaveBeenCalledWith(expect.anything(), "user_123");
  });

  it("returns 400 when signup payload is invalid", async () => {
    const response = await POST(
      new Request("http://localhost/api/v1/auth/signup", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: "",
          email: "not-an-email",
        }),
      }),
    );

    expect(response.status).toBe(400);
    expect(signUpAccount).not.toHaveBeenCalled();
  });
});
