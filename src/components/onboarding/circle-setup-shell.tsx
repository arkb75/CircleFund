"use client";

import { useRouter } from "next/navigation";
import { type FormEvent, useState, useTransition } from "react";
import { ArrowRight, Building2, Users } from "lucide-react";

import type { CircleRedirectResponse } from "@/lib/api-types";
import {
  approvalModes,
  contributionFrequencies,
} from "@/lib/validations/circles";
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
      contributionAmount: Number(formData.get("contributionAmount") ?? 0),
      contributionFrequency: String(formData.get("contributionFrequency") ?? ""),
      maxLoanSize: Number(formData.get("maxLoanSize") ?? 0),
      approvalMode: String(formData.get("approvalMode") ?? ""),
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
      <div className="mx-auto grid max-w-6xl gap-8 lg:grid-cols-[0.95fr_1.05fr]">
        <section className="flex flex-col justify-between rounded-[2.25rem] border border-white/80 bg-white/72 p-6 shadow-[0_24px_100px_rgba(15,23,42,0.12)] backdrop-blur md:p-8">
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
                  Set the contribution cadence, max loan size, and approval style
                  before inviting the rest of the group.
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

                <div className="grid gap-4 sm:grid-cols-2">
                  <label className="space-y-2">
                    <span className="text-sm font-medium text-foreground">
                      Contribution amount
                    </span>
                    <Input
                      type="number"
                      name="contributionAmount"
                      min="1"
                      step="0.01"
                      placeholder="250"
                      className="h-11 rounded-xl border-border/70 bg-white/85 px-3"
                      disabled={isPending}
                      required
                    />
                  </label>
                  <label className="space-y-2">
                    <span className="text-sm font-medium text-foreground">
                      Max loan size
                    </span>
                    <Input
                      type="number"
                      name="maxLoanSize"
                      min="1"
                      step="0.01"
                      placeholder="1000"
                      className="h-11 rounded-xl border-border/70 bg-white/85 px-3"
                      disabled={isPending}
                      required
                    />
                  </label>
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <label className="space-y-2">
                    <span className="text-sm font-medium text-foreground">
                      Contribution frequency
                    </span>
                    <select
                      name="contributionFrequency"
                      className={selectClassName}
                      defaultValue={contributionFrequencies[2]}
                      disabled={isPending}
                    >
                      {contributionFrequencies.map((option) => (
                        <option key={option} value={option}>
                          {formatEnumLabel(option)}
                        </option>
                      ))}
                    </select>
                  </label>
                  <label className="space-y-2">
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
                </div>

                {errorMessage ? (
                  <StatusBanner tone="destructive" message={errorMessage} />
                ) : (
                  <StatusBanner
                    tone="default"
                    message="The account you are using becomes the first admin and receives the circle invite code."
                  />
                )}

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

                {errorMessage ? (
                  <StatusBanner tone="destructive" message={errorMessage} />
                ) : (
                  <StatusBanner
                    tone="default"
                    message="Invite joins create active memberships immediately in this MVP."
                  />
                )}

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
