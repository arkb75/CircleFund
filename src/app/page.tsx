import { redirect } from "next/navigation";
import { ArrowRight, CircleDollarSign, ShieldCheck, Users } from "lucide-react";

import { AuthShell } from "@/components/onboarding/auth-shell";
import { getLatestCircleRedirect } from "@/server/services/circle-dashboard-service";
import { getSessionUserId } from "@/lib/session";

const spotlightMetrics = [
  {
    label: "Contribution cadence",
    value: "Weekly to monthly",
    icon: CircleDollarSign,
  },
  {
    label: "Member access",
    value: "Invite-only circles",
    icon: Users,
  },
  {
    label: "Decision model",
    value: "Human review first",
    icon: ShieldCheck,
  },
];

export default async function Home() {
  const userId = await getSessionUserId();

  if (userId) {
    const latestCircleRedirect = await getLatestCircleRedirect(userId);

    if (latestCircleRedirect) {
      redirect(latestCircleRedirect);
    }

    redirect("/onboarding");
  }

  return (
    <main className="relative min-h-screen overflow-hidden">
      <div className="absolute inset-0 bg-[linear-gradient(135deg,rgba(15,52,32,0.02),transparent_38%)]" />
      <div className="grid min-h-screen lg:grid-cols-[1.1fr_0.9fr]">
        <section className="relative flex items-center px-6 py-12 md:px-10 lg:px-14 xl:px-20">
          <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-primary/35 to-transparent" />
          <div className="absolute -left-24 top-12 h-72 w-72 rounded-full bg-primary/10 blur-3xl [animation:slow-float_10s_ease-in-out_infinite]" />
          <div className="absolute bottom-0 right-0 h-64 w-64 rounded-full bg-[#d8b96f]/18 blur-3xl" />

          <div className="relative mx-auto flex w-full max-w-2xl flex-col gap-10 [animation:rise-in_700ms_ease-out_both]">
            <div className="flex items-center gap-3 text-sm font-medium text-primary">
              <div className="flex size-10 items-center justify-center rounded-full border border-primary/15 bg-primary/10">
                CF
              </div>
              <span>CircleFund</span>
            </div>

            <div className="space-y-6">
              <span className="inline-flex items-center rounded-full border border-primary/15 bg-primary/8 px-4 py-1.5 text-xs font-medium uppercase tracking-[0.24em] text-primary">
                Private community finance
              </span>
              <div className="space-y-4">
                <h1 className="max-w-3xl font-heading text-5xl font-semibold tracking-tight text-foreground md:text-6xl">
                  Bring members into a trusted lending circle through one private account gateway.
                </h1>
                <p className="max-w-2xl text-base leading-8 text-muted-foreground md:text-lg">
                  CircleFund starts with account access, then guides each member into
                  the right next step: join with an invite code or create a new circle
                  with clear contribution rules and private membership controls.
                </p>
              </div>
            </div>

            <div className="grid gap-px overflow-hidden rounded-[2rem] border border-white/80 bg-white/60 shadow-[0_20px_80px_rgba(15,23,42,0.09)] backdrop-blur md:grid-cols-3">
              {spotlightMetrics.map(({ label, value, icon: Icon }, index) => (
                <div
                  key={label}
                  className="bg-[#fbfaf6] px-5 py-6 [animation:rise-in_700ms_ease-out_both]"
                  style={{ animationDelay: `${180 + index * 90}ms` }}
                >
                  <div className="flex items-center gap-2 text-xs uppercase tracking-[0.22em] text-muted-foreground">
                    <Icon className="size-4 text-primary" />
                    {label}
                  </div>
                  <div className="mt-4 text-xl font-semibold text-foreground">
                    {value}
                  </div>
                </div>
              ))}
            </div>

            <div className="flex items-center gap-3 text-sm text-muted-foreground">
              <ArrowRight className="size-4 text-primary" />
              Advisory risk models, contribution tracking, and loan reviews can layer on
              top of this initial foundation later.
            </div>
          </div>
        </section>

        <section className="relative flex items-center justify-center border-t border-white/60 px-6 py-10 lg:border-t-0 lg:border-l lg:border-white/60 lg:px-10 xl:px-14">
          <AuthShell />
        </section>
      </div>
    </main>
  );
}
