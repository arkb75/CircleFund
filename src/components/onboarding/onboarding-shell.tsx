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

  return (
    <div className={`rounded-2xl border px-4 py-3 text-sm ${classes}`}>
      {message}
    </div>
  );
}

export function OnboardingShell() {
  const router = useRouter();
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function handleCreateSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setErrorMessage(null);

    const formData = new FormData(event.currentTarget);
    const payload = {
      user: {
        name: String(formData.get("name") ?? ""),
        email: String(formData.get("email") ?? ""),
      },
      circle: {
        name: String(formData.get("circleName") ?? ""),
        contributionAmount: Number(formData.get("contributionAmount") ?? 0),
        contributionFrequency: String(
          formData.get("contributionFrequency") ?? "",
        ),
        maxLoanSize: Number(formData.get("maxLoanSize") ?? 0),
        approvalMode: String(formData.get("approvalMode") ?? ""),
      },
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
      user: {
        name: String(formData.get("name") ?? ""),
        email: String(formData.get("email") ?? ""),
      },
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
    <div
      className="w-full max-w-xl rounded-[2rem] border border-white/70 bg-white/80 p-6 shadow-[0_20px_80px_rgba(15,23,42,0.12)] backdrop-blur xl:p-8 [animation:rise-in_700ms_ease-out_both_120ms]"
    >
      <div className="flex items-start justify-between gap-4">
        <div className="space-y-2">
          <Badge variant="outline" className="border-primary/15 bg-primary/8 text-primary">
            Private circle onboarding
          </Badge>
          <div>
            <h2 className="font-heading text-3xl font-semibold tracking-tight text-foreground">
              Open the circle.
            </h2>
            <p className="mt-2 max-w-md text-sm leading-6 text-muted-foreground">
              Create a new ROSCA or join an existing one with the invite code your
              community organizer shared.
            </p>
          </div>
        </div>
        <div className="hidden rounded-full border border-primary/10 bg-primary/8 p-3 text-primary sm:block">
          <Building2 className="size-5" />
        </div>
      </div>

      <Tabs defaultValue="create" className="mt-8 gap-5">
        <TabsList className="grid w-full grid-cols-2 rounded-2xl bg-[#eef4ef] p-1">
          <TabsTrigger value="create" className="rounded-xl text-sm">
            Create circle
          </TabsTrigger>
          <TabsTrigger value="join" className="rounded-xl text-sm">
            Join by invite
          </TabsTrigger>
        </TabsList>

        <TabsContent value="create" className="space-y-5">
          <form className="space-y-5" onSubmit={handleCreateSubmit}>
            <div className="grid gap-4 sm:grid-cols-2">
              <label className="space-y-2">
                <span className="text-sm font-medium text-foreground">Your name</span>
                <Input
                  name="name"
                  placeholder="Amina Yusuf"
                  className="h-11 rounded-xl border-border/70 bg-white/85 px-3"
                  disabled={isPending}
                  required
                />
              </label>
              <label className="space-y-2">
                <span className="text-sm font-medium text-foreground">Email</span>
                <Input
                  type="email"
                  name="email"
                  placeholder="amina@circlefund.app"
                  className="h-11 rounded-xl border-border/70 bg-white/85 px-3"
                  disabled={isPending}
                  required
                />
              </label>
            </div>

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
                <span className="text-sm font-medium text-foreground">Approval mode</span>
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
                message="The first member becomes the circle admin and receives a shareable invite code."
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
          <form className="space-y-5" onSubmit={handleJoinSubmit}>
            <div className="grid gap-4 sm:grid-cols-2">
              <label className="space-y-2">
                <span className="text-sm font-medium text-foreground">Your name</span>
                <Input
                  name="name"
                  placeholder="Kwame Adebayo"
                  className="h-11 rounded-xl border-border/70 bg-white/85 px-3"
                  disabled={isPending}
                  required
                />
              </label>
              <label className="space-y-2">
                <span className="text-sm font-medium text-foreground">Email</span>
                <Input
                  type="email"
                  name="email"
                  placeholder="kwame@circlefund.app"
                  className="h-11 rounded-xl border-border/70 bg-white/85 px-3"
                  disabled={isPending}
                  required
                />
              </label>
            </div>

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
                message="Members join privately with the invite code and land directly inside the circle dashboard."
              />
            )}

            <div className="rounded-[1.75rem] border border-border/70 bg-[#f6f4ee] px-5 py-4 text-sm text-muted-foreground">
              <div className="flex items-center gap-3 text-foreground">
                <Users className="size-4 text-primary" />
                <span className="font-medium">Invite code onboarding</span>
              </div>
              <p className="mt-2 leading-6">
                This MVP creates active memberships immediately. Approval and reviewer
                workflows can be layered in later without changing the onboarding API.
              </p>
            </div>

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
    </div>
  );
}
