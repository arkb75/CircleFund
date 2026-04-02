import { describe, expect, it } from "vitest";

import { POST } from "@/app/api/v1/session/logout/route";

describe("POST /api/v1/session/logout", () => {
  it("clears the session cookie and redirects home", async () => {
    const response = await POST(
      new Request("http://localhost/api/v1/session/logout", {
        method: "POST",
      }),
    );

    expect(response.status).toBe(303);
    expect(response.headers.get("location")).toBe("http://localhost/");
    expect(response.headers.get("set-cookie")).toContain("circlefund_session=");
  });
});
