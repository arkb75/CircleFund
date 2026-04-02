import { NextResponse } from "next/server";

import { clearSessionCookie } from "@/lib/session";

export async function POST(request: Request) {
  const redirectUrl = new URL("/", request.url);
  const response = NextResponse.redirect(redirectUrl, { status: 303 });

  clearSessionCookie(response);

  return response;
}
