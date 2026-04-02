import { beforeEach, describe, expect, it, vi } from "vitest";

import { POST } from "@/app/api/v1/auth/login/route";
import { ServiceError } from "@/server/services/service-error";

const { signInAccount, setSessionCookie } = vi.hoisted(() => ({
  signInAccount: vi.fn(),
  setSessionCookie: vi.fn(),
}));

vi.mock("@/server/services/auth-service", () => ({
  signInAccount,
}));

vi.mock("@/lib/session", () => ({
  setSessionCookie,
}));

describe("POST /api/v1/auth/login", () => {
  beforeEach(() => {
    signInAccount.mockReset();
    setSessionCookie.mockReset();
  });

  it("signs in an existing user and returns the redirect target", async () => {
    signInAccount.mockResolvedValue({
      userId: "user_123",
      redirectTo: "/circles/circle_123",
    });

    const response = await POST(
      new Request("http://localhost/api/v1/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: "amina@example.com",
        }),
      }),
    );

    expect(response.status).toBe(200);
    expect(await response.json()).toEqual({
      redirectTo: "/circles/circle_123",
    });
    expect(setSessionCookie).toHaveBeenCalledWith(expect.anything(), "user_123");
  });

  it("returns a not found error for unknown accounts", async () => {
    signInAccount.mockRejectedValue(
      new ServiceError(
        404,
        "ACCOUNT_NOT_FOUND",
        "No account exists for that email yet. Create one first.",
      ),
    );

    const response = await POST(
      new Request("http://localhost/api/v1/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: "missing@example.com",
        }),
      }),
    );

    expect(response.status).toBe(404);
    expect(await response.json()).toEqual({
      error: {
        code: "ACCOUNT_NOT_FOUND",
        message: "No account exists for that email yet. Create one first.",
      },
    });
  });
});
