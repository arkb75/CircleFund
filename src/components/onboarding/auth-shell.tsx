"use client";

import { useRouter } from "next/navigation";
import { type FormEvent, useState, useTransition } from "react";
import { ArrowRight } from "lucide-react";

import type { AuthRedirectResponse } from "@/lib/api-types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

type ApiErrorPayload = {
  error?: {
    message?: string;
  };
};

function getErrorMessage(payload: ApiErrorPayload | null) {
  return payload?.error?.message ?? "Something went wrong. Please try again.";
}

async function submitRequest(
  path: string,
  payload: unknown,
): Promise<AuthRedirectResponse> {
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

  return (await response.json()) as AuthRedirectResponse;
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

function AuthMotionPanel() {
  return (
    <div className="mt-5 flex justify-center">
      <div
        aria-hidden="true"
        className="relative aspect-square w-full max-w-[18.5rem] overflow-hidden rounded-[2rem] border border-border/70 bg-[radial-gradient(circle_at_top_left,_rgba(255,255,255,0.98),_rgba(246,244,238,0.94)_42%,_rgba(230,238,232,0.96)_100%)] shadow-[inset_0_1px_0_rgba(255,255,255,0.75),0_16px_48px_rgba(15,23,42,0.08)]"
      >
        <div className="absolute inset-0 opacity-45 [background-image:linear-gradient(rgba(28,64,45,0.08)_1px,transparent_1px),linear-gradient(90deg,rgba(28,64,45,0.08)_1px,transparent_1px)] [background-size:22px_22px]" />
        <div
          className="absolute -left-8 top-6 h-28 w-28 rounded-full bg-primary/12 blur-2xl"
          style={{ animation: "auth-drift 12s ease-in-out infinite" }}
        />
        <div
          className="absolute -right-6 bottom-4 h-24 w-24 rounded-full bg-[#d8b96f]/20 blur-2xl"
          style={{ animation: "auth-drift 14s ease-in-out infinite reverse" }}
        />
        <div className="absolute inset-5 rounded-[1.6rem] border border-white/70 bg-white/34 backdrop-blur-[1px]" />

        <div className="absolute left-1/2 top-1/2 h-40 w-40 -translate-x-1/2 -translate-y-1/2 rounded-full border border-primary/14" />
        <div className="absolute left-1/2 top-1/2 h-26 w-26 -translate-x-1/2 -translate-y-1/2 rounded-full border border-primary/10" />

        <div
          className="absolute left-1/2 top-1/2 h-40 w-40 -translate-x-1/2 -translate-y-1/2"
          style={{ animation: "auth-orbit 16s linear infinite" }}
        >
          <div className="absolute left-1/2 top-0 h-3.5 w-3.5 -translate-x-1/2 rounded-full bg-primary shadow-[0_0_0_6px_rgba(39,107,67,0.12)]" />
          <div className="absolute bottom-4 left-3 h-3 w-3 rounded-full bg-[#d8b96f] shadow-[0_0_0_6px_rgba(216,185,111,0.14)]" />
          <div className="absolute bottom-2 right-5 h-2.5 w-2.5 rounded-full bg-foreground/75 shadow-[0_0_0_6px_rgba(30,41,35,0.08)]" />
        </div>

        <div className="absolute left-1/2 top-1/2 h-20 w-20 -translate-x-1/2 -translate-y-1/2 rounded-[1.5rem] border border-white/80 bg-white/80 shadow-[0_12px_30px_rgba(15,23,42,0.08)] backdrop-blur">
          <div className="flex h-full items-center justify-center">
            <div className="grid grid-cols-2 gap-2">
              <div
                className="h-3 w-3 rounded-full bg-primary/85"
                style={{ animation: "auth-breathe 2.8s ease-in-out infinite" }}
              />
              <div
                className="h-3 w-3 rounded-full bg-[#d8b96f]/85"
                style={{ animation: "auth-breathe 2.8s ease-in-out infinite 350ms" }}
              />
              <div
                className="h-3 w-3 rounded-full bg-foreground/70"
                style={{ animation: "auth-breathe 2.8s ease-in-out infinite 700ms" }}
              />
              <div
                className="h-3 w-3 rounded-full bg-primary/35"
                style={{ animation: "auth-breathe 2.8s ease-in-out infinite 1050ms" }}
              />
            </div>
          </div>
        </div>

        <div className="absolute left-7 top-7 h-14 w-20 rounded-[1.25rem] border border-white/70 bg-white/65 backdrop-blur-sm" />
        <div className="absolute bottom-7 right-7 h-12 w-24 rounded-[1.25rem] border border-white/70 bg-white/58 backdrop-blur-sm" />
      </div>
    </div>
  );
}

export function AuthShell() {
  const router = useRouter();
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function handleSignIn(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setErrorMessage(null);

    const formData = new FormData(event.currentTarget);
    const payload = {
      email: String(formData.get("email") ?? ""),
    };

    startTransition(async () => {
      try {
        const response = await submitRequest("/api/v1/auth/login", payload);
        router.push(response.redirectTo);
      } catch (error) {
        setErrorMessage(
          error instanceof Error ? error.message : "Unable to sign you in.",
        );
      }
    });
  }

  function handleSignUp(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setErrorMessage(null);

    const formData = new FormData(event.currentTarget);
    const payload = {
      name: String(formData.get("name") ?? ""),
      email: String(formData.get("email") ?? ""),
      inviteCode: String(formData.get("inviteCode") ?? ""),
    };

    startTransition(async () => {
      try {
        const response = await submitRequest("/api/v1/auth/signup", payload);
        router.push(response.redirectTo);
      } catch (error) {
        setErrorMessage(
          error instanceof Error ? error.message : "Unable to create your account.",
        );
      }
    });
  }

  return (
    <div className="w-full max-w-xl rounded-[2rem] border border-white/70 bg-white/82 p-6 shadow-[0_20px_80px_rgba(15,23,42,0.12)] backdrop-blur xl:p-8 [animation:rise-in_700ms_ease-out_both_120ms]">
      <div className="space-y-2">
        <h2 className="font-heading text-3xl font-semibold tracking-tight text-foreground">
          Sign in or create your account
        </h2>
        <p className="max-w-md text-sm leading-6 text-muted-foreground">
          Enter your details to continue into your private CircleFund workspace.
        </p>
      </div>

      <Tabs defaultValue="signin" className="mt-8 gap-5">
        <TabsList className="grid w-full grid-cols-2 rounded-2xl bg-[#eef4ef] p-1">
          <TabsTrigger value="signin" className="rounded-xl text-sm">
            Sign in
          </TabsTrigger>
          <TabsTrigger value="signup" className="rounded-xl text-sm">
            Create account
          </TabsTrigger>
        </TabsList>

        <AuthMotionPanel />

        <TabsContent value="signin" className="space-y-5">
          <form className="space-y-5" onSubmit={handleSignIn}>
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

            {errorMessage ? <StatusBanner tone="destructive" message={errorMessage} /> : null}

            <div className="pt-2">
              <Button
                type="submit"
                size="lg"
                disabled={isPending}
                className="h-11 w-full rounded-xl bg-primary text-primary-foreground shadow-[0_12px_35px_rgba(16,82,52,0.22)]"
              >
                {isPending ? "Signing in..." : "Sign in"}
                <ArrowRight className="size-4" />
              </Button>
            </div>
          </form>
        </TabsContent>

        <TabsContent value="signup" className="space-y-5">
          <form className="space-y-5" onSubmit={handleSignUp}>
            <div className="grid gap-4 sm:grid-cols-2">
              <label className="space-y-2">
                <span className="text-sm font-medium text-foreground">Full name</span>
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
              <span className="text-sm font-medium text-foreground">
                Invite code <span className="text-muted-foreground">(optional)</span>
              </span>
              <Input
                name="inviteCode"
                placeholder="AB8K2Q9L"
                className="h-11 rounded-xl border-border/70 bg-white/85 px-3 font-mono uppercase tracking-[0.24em]"
                disabled={isPending}
              />
            </label>

            {errorMessage ? <StatusBanner tone="destructive" message={errorMessage} /> : null}

            <div className="pt-2">
              <Button
                type="submit"
                size="lg"
                disabled={isPending}
                className="h-11 w-full rounded-xl bg-primary text-primary-foreground shadow-[0_12px_35px_rgba(16,82,52,0.22)]"
              >
                {isPending ? "Creating account..." : "Create account"}
                <ArrowRight className="size-4" />
              </Button>
            </div>
          </form>
        </TabsContent>
      </Tabs>
    </div>
  );
}
