import { cookies, headers } from "next/headers";
import { notFound, redirect } from "next/navigation";

import type { CircleDashboardResponse } from "@/lib/api-types";

function getBaseUrl(host: string, forwardedProto?: string | null) {
  if (host.startsWith("localhost") || host.startsWith("127.0.0.1")) {
    return `http://${host}`;
  }

  return `${forwardedProto ?? "https"}://${host}`;
}

export async function fetchCircleDashboard(circleId: string) {
  const headerStore = await headers();
  const cookieStore = await cookies();
  const host = headerStore.get("x-forwarded-host") ?? headerStore.get("host");

  if (!host) {
    throw new Error("Unable to resolve the current host.");
  }

  const response = await fetch(
    `${getBaseUrl(host, headerStore.get("x-forwarded-proto"))}/api/v1/circles/${circleId}`,
    {
      headers: {
        cookie: cookieStore.toString(),
      },
      cache: "no-store",
    },
  );

  if (response.status === 403) {
    redirect("/");
  }

  if (response.status === 404) {
    notFound();
  }

  if (!response.ok) {
    throw new Error("Unable to load the circle dashboard.");
  }

  return (await response.json()) as CircleDashboardResponse;
}
