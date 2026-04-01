import { createHmac, timingSafeEqual } from "node:crypto";

import { cookies } from "next/headers";
import { NextResponse } from "next/server";

import { getRequiredEnv } from "@/lib/env";

export const SESSION_COOKIE_NAME = "circlefund_session";

type SessionPayload = {
  userId: string;
};

function signSessionPayload(payload: string) {
  return createHmac("sha256", getRequiredEnv("SESSION_SECRET"))
    .update(payload)
    .digest("hex");
}

export function createSessionToken(payload: SessionPayload) {
  const encodedPayload = Buffer.from(JSON.stringify(payload)).toString("base64url");
  const signature = signSessionPayload(encodedPayload);

  return `${encodedPayload}.${signature}`;
}

export function readSessionToken(token?: string | null) {
  if (!token) {
    return null;
  }

  const [encodedPayload, signature] = token.split(".");

  if (!encodedPayload || !signature) {
    return null;
  }

  const expectedSignature = signSessionPayload(encodedPayload);
  const signatureBuffer = Buffer.from(signature, "hex");
  const expectedBuffer = Buffer.from(expectedSignature, "hex");

  if (signatureBuffer.length !== expectedBuffer.length) {
    return null;
  }

  if (!timingSafeEqual(signatureBuffer, expectedBuffer)) {
    return null;
  }

  try {
    const parsed = JSON.parse(
      Buffer.from(encodedPayload, "base64url").toString("utf8"),
    ) as Partial<SessionPayload>;

    if (!parsed.userId || typeof parsed.userId !== "string") {
      return null;
    }

    return { userId: parsed.userId };
  } catch {
    return null;
  }
}

export function setSessionCookie(response: NextResponse, userId: string) {
  response.cookies.set({
    name: SESSION_COOKIE_NAME,
    value: createSessionToken({ userId }),
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 24 * 30,
  });
}

export async function getSessionUserId() {
  const cookieStore = await cookies();
  return readSessionToken(cookieStore.get(SESSION_COOKIE_NAME)?.value)?.userId ?? null;
}
