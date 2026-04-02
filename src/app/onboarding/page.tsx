import { redirect } from "next/navigation";

import { CircleSetupShell } from "@/components/onboarding/circle-setup-shell";
import { getSessionUserId } from "@/lib/session";
import { getLatestCircleRedirect } from "@/server/services/circle-dashboard-service";

export default async function OnboardingPage() {
  const userId = await getSessionUserId();

  if (!userId) {
    redirect("/");
  }

  const latestCircleRedirect = await getLatestCircleRedirect(userId);

  if (latestCircleRedirect) {
    redirect(latestCircleRedirect);
  }

  return <CircleSetupShell />;
}
