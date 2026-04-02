"use client";

import { useRouter } from "next/navigation";
import { type ComponentProps, type FormEvent, useState, useTransition } from "react";
import { ArrowRight, Building2, Users } from "lucide-react";

import type { CircleRedirectResponse } from "@/lib/api-types";
import { approvalModes } from "@/lib/validations/circles";
import { formatEnumLabel } from "@/lib/strings";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

type ApiErrorPayload = {
  error?: {
    message?: string;
  };
};

const selectClassName =
  "flex h-11 w-full rounded-xl border border-border/70 bg-white/85 px-3 text-sm text-foreground outline-none transition focus:border-primary focus:ring-4 focus:ring-primary/10";

function readOptionalNumber(formData: FormData, key: string) {
  const value = String(formData.get(key) ?? "").trim();

  if (!value) {
    return undefined;
  }

  return Number(value);
}

function getErrorMessage(payload: ApiErrorPayload | null) {
  return payload?.error?.message ?? "Something went wrong. Please try again.";
}

async function submitRequest(
  path: string,
  payload: unknown,
): Promise<CircleRedirectResponse> {
  const response = await fetch(path, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const errorPayload = (await response.json().catch(() => null)) as ApiErrorPayload | null;
    throw new Error(getErrorMessage(errorPayload));
  }

  return (await response.json()) as CircleRedirectResponse;
}

function StatusBanner({
  tone,
  message,
}: {
  tone: "default" | "destructive";
  message: string;
}) {
  const classes =
    tone === "destructive"
      ? "border-destructive/20 bg-destructive/8 text-destructive"
      : "border-primary/15 bg-primary/8 text-primary";

  return <div className={`rounded-2xl border px-4 py-3 text-sm ${classes}`}>{message}</div>;
}

function UnitInput({
  unit,
  inputClassName,
  ...props
}: ComponentProps<typeof Input> & {
  unit: string;
  inputClassName?: string;
}) {
  return (
    <div className="relative">
      <Input
        {...props}
        className={`h-11 rounded-xl border-border/70 bg-white/85 pr-16 pl-3 ${inputClassName ?? ""}`.trim()}
      />
      <span className="pointer-events-none absolute inset-y-0 right-4 flex items-center text-sm font-medium text-muted-foreground">
        {unit}
      </span>
    </div>
  );
}

export function CircleSetupShell() {
  const router = useRouter();
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function handleCreateSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setErrorMessage(null);

    const formData = new FormData(event.currentTarget);
    const payload = {
      name: String(formData.get("circleName") ?? ""),
      approvalMode: String(formData.get("approvalMode") ?? ""),
      minimumMonthlyContribution: Number(
        formData.get("minimumMonthlyContribution") ?? 0,
      ),
      minimumReserveBalance: Number(formData.get("minimumReserveBalance") ?? 0),
      minimumMembershipDurationMonths: readOptionalNumber(
        formData,
        "minimumMembershipDurationMonths",
      ),
      maxActiveLoansPerMember: readOptionalNumber(
        formData,
        "maxActiveLoansPerMember",
      ),
      maxRepaymentTermMonths: readOptionalNumber(formData, "maxRepaymentTermMonths"),
    };

    startTransition(async () => {
      try {
        const response = await submitRequest("/api/v1/circles", payload);
        router.push(response.redirectTo);
      } catch (error) {
        setErrorMessage(
          error instanceof Error ? error.message : "Unable to create the circle.",
        );
      }
    });
  }

  function handleJoinSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setErrorMessage(null);

    const formData = new FormData(event.currentTarget);
    const payload = {
      inviteCode: String(formData.get("inviteCode") ?? ""),
    };

    startTransition(async () => {
      try {
        const response = await submitRequest("/api/v1/circles/join", payload);
        router.push(response.redirectTo);
      } catch (error) {
        setErrorMessage(
          error instanceof Error ? error.message : "Unable to join the circle.",
        );
      }
    });
  }

  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top_left,_rgba(37,99,63,0.14),_transparent_30%),linear-gradient(180deg,#faf8f2_0%,#f4f7f5_100%)] px-6 py-8 text-foreground md:px-10">
      <div className="mx-auto grid max-w-6xl gap-8 lg:items-start lg:grid-cols-[0.95fr_1.05fr]">
        <section className="flex flex-col justify-between self-start rounded-[2.25rem] border border-white/80 bg-white/72 p-6 shadow-[0_24px_100px_rgba(15,23,42,0.12)] backdrop-blur md:p-8">
          <div className="space-y-6">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <Badge className="w-fit bg-primary/10 text-primary hover:bg-primary/10">
                Signed-in onboarding
              </Badge>
              <form action="/api/v1/session/logout" method="POST">
                <Button
                  type="submit"
                  variant="outline"
                  className="h-9 rounded-full border-primary/15 bg-white/80 px-4 text-sm text-foreground hover:bg-white"
                >
                  Log out
                </Button>
              </form>
            </div>
            <div className="space-y-4">
              <h1 className="font-heading text-4xl font-semibold tracking-tight md:text-5xl">
                Choose how this account enters CircleFund.
              </h1>
              <p className="max-w-xl text-sm leading-7 text-muted-foreground md:text-base">
                Use an invite code if you already belong to a private community
                circle. If not, create your own circle and define the core
                contribution rules from the start.
              </p>
            </div>
          </div>

          <div className="mt-10 grid gap-px overflow-hidden rounded-[2rem] border border-border/70 bg-[#e6ece8]">
            <div className="grid gap-0 sm:grid-cols-2">
              <div className="bg-[#fbfaf6] px-5 py-6">
                <div className="flex items-center gap-2 text-xs uppercase tracking-[0.22em] text-muted-foreground">
                  <Users className="size-4 text-primary" />
                  Join existing
                </div>
                <div className="mt-4 text-xl font-semibold">Invite-based access</div>
                <p className="mt-2 text-sm leading-6 text-muted-foreground">
                  Private communities can add members with a code and bring them
                  directly into the circle workspace.
                </p>
              </div>
              <div className="bg-[#fbfaf6] px-5 py-6">
                <div className="flex items-center gap-2 text-xs uppercase tracking-[0.22em] text-muted-foreground">
                  <Building2 className="size-4 text-primary" />
                  Start new
                </div>
                <div className="mt-4 text-xl font-semibold">Create your circle</div>
                <p className="mt-2 text-sm leading-6 text-muted-foreground">
                  Set the approval policy, contribution floor, and borrowing
                  guardrails before inviting the rest of the group.
                </p>
              </div>
            </div>
          </div>
        </section>

        <section className="rounded-[2.25rem] border border-white/80 bg-white/82 p-6 shadow-[0_24px_100px_rgba(15,23,42,0.12)] backdrop-blur md:p-8">
          <Tabs defaultValue="create" className="gap-5">
            <TabsList className="grid w-full grid-cols-2 rounded-2xl bg-[#eef4ef] p-1">
              <TabsTrigger value="create" className="rounded-xl text-sm">
                Create circle
              </TabsTrigger>
              <TabsTrigger value="join" className="rounded-xl text-sm">
                Use invite code
              </TabsTrigger>
            </TabsList>

            <TabsContent value="create" className="space-y-5">
              <div className="space-y-2">
                <h2 className="font-heading text-3xl font-semibold tracking-tight">
                  Start a new circle
                </h2>
                <p className="text-sm leading-6 text-muted-foreground">
                  You are already signed in. This step only defines the circle itself.
                </p>
              </div>

              <form className="space-y-5" onSubmit={handleCreateSubmit}>
                <label className="space-y-2">
                  <span className="text-sm font-medium text-foreground">Circle name</span>
                  <Input
                    name="circleName"
                    placeholder="North Hill Community Circle"
                    className="h-11 rounded-xl border-border/70 bg-white/85 px-3"
                    disabled={isPending}
                    required
                  />
                </label>

                <div className="rounded-[1.5rem] border border-border/70 bg-[#f8f6f1] p-4">
                  <div className="mb-4">
                    <div className="text-sm font-semibold text-foreground">Required</div>
                    <p className="mt-1 text-sm leading-6 text-muted-foreground">
                      These settings define the base borrowing policy for the circle.
                    </p>
                  </div>

                  <div className="grid gap-4 sm:grid-cols-2">
                    <label className="space-y-2 sm:col-span-2">
                      <span className="text-sm font-medium text-foreground">
                        Approval mode
                      </span>
                      <select
                        name="approvalMode"
                        className={selectClassName}
                        defaultValue={approvalModes[0]}
                        disabled={isPending}
                      >
                        {approvalModes.map((option) => (
                          <option key={option} value={option}>
                            {formatEnumLabel(option)}
                          </option>
                        ))}
                      </select>
                    </label>

                    <label className="space-y-2">
                      <span className="text-sm font-medium text-foreground">
                        Minimum monthly contribution
                      </span>
                      <UnitInput
                        type="number"
                        name="minimumMonthlyContribution"
                        min="0.01"
                        step="0.01"
                        placeholder="250"
                        unit="USD"
                        disabled={isPending}
                        required
                      />
                    </label>
                    <label className="space-y-2">
                      <span className="text-sm font-medium text-foreground">
                        Minimum reserve balance
                      </span>
                      <UnitInput
                        type="number"
                        name="minimumReserveBalance"
                        min="0"
                        step="0.01"
                        placeholder="1000"
                        unit="USD"
                        disabled={isPending}
                        required
                      />
                    </label>
                  </div>
                </div>

                <div className="rounded-[1.5rem] border border-border/70 bg-white/70 p-4">
                  <div className="mb-4">
                    <div className="text-sm font-semibold text-foreground">Optional</div>
                    <p className="mt-1 text-sm leading-6 text-muted-foreground">
                      Add tighter borrower limits now, or leave them open for later.
                    </p>
                  </div>

                  <div className="grid gap-4 sm:grid-cols-2">
                    <label className="flex flex-col gap-2">
                      <span className="min-h-[3.5rem] text-sm font-medium text-foreground">
                        Minimum membership duration before borrowing
                      </span>
                      <UnitInput
                        type="number"
                        name="minimumMembershipDurationMonths"
                        min="1"
                        step="1"
                        placeholder="3"
                        unit="months"
                        disabled={isPending}
                      />
                    </label>
                    <label className="flex flex-col gap-2">
                      <span className="min-h-[3.5rem] text-sm font-medium text-foreground">
                        Max active loans per member
                      </span>
                      <UnitInput
                        type="number"
                        name="maxActiveLoansPerMember"
                        min="1"
                        step="1"
                        placeholder="1"
                        unit="loans"
                        disabled={isPending}
                      />
                    </label>

                    <label className="space-y-2 sm:col-span-2">
                      <span className="text-sm font-medium text-foreground">
                        Max repayment term
                      </span>
                      <UnitInput
                        type="number"
                        name="maxRepaymentTermMonths"
                        min="1"
                        step="1"
                        placeholder="6"
                        unit="months"
                        disabled={isPending}
                      />
                    </label>
                  </div>
                </div>

                {errorMessage ? <StatusBanner tone="destructive" message={errorMessage} /> : null}

                <Button
                  type="submit"
                  size="lg"
                  disabled={isPending}
                  className="h-11 w-full rounded-xl bg-primary text-primary-foreground shadow-[0_12px_35px_rgba(16,82,52,0.22)]"
                >
                  {isPending ? "Creating circle..." : "Create circle"}
                  <ArrowRight className="size-4" />
                </Button>
              </form>
            </TabsContent>

            <TabsContent value="join" className="space-y-5">
              <div className="space-y-2">
                <h2 className="font-heading text-3xl font-semibold tracking-tight">
                  Join with an invite code
                </h2>
                <p className="text-sm leading-6 text-muted-foreground">
                  If another organizer already invited you, use the code here and
                  enter the circle immediately.
                </p>
              </div>

              <form className="space-y-5" onSubmit={handleJoinSubmit}>
                <label className="space-y-2">
                  <span className="text-sm font-medium text-foreground">Invite code</span>
                  <Input
                    name="inviteCode"
                    placeholder="AB8K2Q9L"
                    className="h-11 rounded-xl border-border/70 bg-white/85 px-3 font-mono uppercase tracking-[0.24em]"
                    disabled={isPending}
                    required
                  />
                </label>

                {errorMessage ? <StatusBanner tone="destructive" message={errorMessage} /> : null}

                <Button
                  type="submit"
                  size="lg"
                  disabled={isPending}
                  className="h-11 w-full rounded-xl bg-primary text-primary-foreground shadow-[0_12px_35px_rgba(16,82,52,0.22)]"
                >
                  {isPending ? "Joining circle..." : "Join circle"}
                  <ArrowRight className="size-4" />
                </Button>
              </form>
            </TabsContent>
          </Tabs>
        </section>
      </div>
    </main>
  );
}
