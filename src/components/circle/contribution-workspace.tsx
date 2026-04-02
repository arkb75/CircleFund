"use client";

import { useRouter } from "next/navigation";
import {
  type ComponentProps,
  type FormEvent,
  useEffect,
  useState,
  useTransition,
} from "react";

import { getTodayDateInputValue } from "@/lib/contribution-periods";
import type {
  CircleDashboardResponse,
  ContributionCreateResponse,
  ContributionHistoryResponse,
} from "@/lib/api-types";
import { formatEnumLabel } from "@/lib/strings";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

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

function formatDateLabel(value: string) {
  return new Date(`${value}T00:00:00.000Z`).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    timeZone: "UTC",
  });
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

async function fetchContributionHistory(
  circleId: string,
  membershipId: string,
): Promise<ContributionHistoryResponse> {
  const response = await fetch(
    `/api/v1/circles/${circleId}/contributions?membershipId=${encodeURIComponent(membershipId)}`,
    {
      cache: "no-store",
    },
  );

  if (!response.ok) {
    const errorPayload = (await response.json().catch(() => null)) as ApiErrorPayload | null;
    throw new Error(getErrorMessage(errorPayload));
  }

  return (await response.json()) as ContributionHistoryResponse;
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
        className={`h-11 rounded-xl border-border/70 bg-white/85 pr-18 pl-3 ${inputClassName ?? ""}`.trim()}
      />
      <span className="pointer-events-none absolute inset-y-0 right-4 flex items-center text-sm font-medium text-muted-foreground">
        {unit}
      </span>
    </div>
  );
}

export function ContributionWorkspace({
  dashboard,
}: {
  dashboard: CircleDashboardResponse;
}) {
  const router = useRouter();
  const viewerIsAdmin = dashboard.viewerMembership.role === "ADMIN";
  const activeMembers = dashboard.members.filter((member) => member.status === "ACTIVE");
  const [selectedMembershipId, setSelectedMembershipId] = useState(
    dashboard.viewerMembership.membershipId,
  );
  const [formMembershipId, setFormMembershipId] = useState(
    viewerIsAdmin
      ? dashboard.viewerMembership.membershipId
      : dashboard.viewerMembership.membershipId,
  );
  const [amount, setAmount] = useState("");
  const [contributedOn, setContributedOn] = useState(getTodayDateInputValue());
  const [history, setHistory] = useState<ContributionHistoryResponse | null>(null);
  const [historyError, setHistoryError] = useState<string | null>(null);
  const [formError, setFormError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [isLoadingHistory, setIsLoadingHistory] = useState(false);
  const [isSubmitting, startTransition] = useTransition();
  const viewerMember =
    dashboard.members.find(
      (member) => member.membershipId === dashboard.viewerMembership.membershipId,
    ) ?? dashboard.members[0];

  useEffect(() => {
    let isActive = true;

    async function loadHistory() {
      setIsLoadingHistory(true);
      setHistoryError(null);

      try {
        const payload = await fetchContributionHistory(
          dashboard.circle.id,
          selectedMembershipId,
        );

        if (isActive) {
          setHistory(payload);
        }
      } catch (error) {
        if (isActive) {
          setHistoryError(
            error instanceof Error
              ? error.message
              : "Unable to load contribution history.",
          );
        }
      } finally {
        if (isActive) {
          setIsLoadingHistory(false);
        }
      }
    }

    void loadHistory();

    return () => {
      isActive = false;
    };
  }, [dashboard.circle.id, selectedMembershipId]);

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setFormError(null);
    setSuccessMessage(null);

    const targetMembershipId = viewerIsAdmin
      ? formMembershipId
      : dashboard.viewerMembership.membershipId;

    startTransition(async () => {
      try {
        const response = await fetch(
          `/api/v1/circles/${dashboard.circle.id}/contributions`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              membershipId: targetMembershipId,
              amount: Number(amount),
              contributedOn,
            }),
          },
        );

        if (response.status === 403) {
          router.push("/");
          return;
        }

        if (!response.ok) {
          const errorPayload = (await response.json().catch(() => null)) as ApiErrorPayload | null;
          throw new Error(getErrorMessage(errorPayload));
        }

        const payload = (await response.json()) as ContributionCreateResponse;
        const targetMember = dashboard.members.find(
          (member) => member.membershipId === targetMembershipId,
        );

        setAmount("");
        setContributedOn(getTodayDateInputValue());
        setSelectedMembershipId(targetMembershipId);
        setSuccessMessage(
          `Logged ${payload.contribution.amountFormatted} for ${targetMember?.name ?? "member"}.`,
        );

        try {
          const historyPayload = await fetchContributionHistory(
            dashboard.circle.id,
            targetMembershipId,
          );
          setHistory(historyPayload);
          setHistoryError(null);
        } catch (error) {
          setHistoryError(
            error instanceof Error
              ? error.message
              : "Unable to load contribution history.",
          );
        }

        router.refresh();
      } catch (error) {
        setFormError(
          error instanceof Error
            ? error.message
            : "Unable to log the contribution.",
        );
      }
    });
  }

  const selectedMember =
    dashboard.members.find((member) => member.membershipId === selectedMembershipId) ??
    dashboard.members[0];

  return (
    <section className="grid gap-0 border-b border-border/70 lg:grid-cols-[0.8fr_1.2fr]">
      <div className="border-b border-border/70 px-6 py-6 md:px-8 lg:border-r lg:border-b-0">
        <div className="space-y-2">
          <h2 className="text-2xl font-semibold tracking-tight">Log contribution</h2>
          <p className="text-sm leading-6 text-muted-foreground">
            Record manual contribution activity for {dashboard.circle.currentContributionPeriodLabel}.
          </p>
        </div>

        <form className="mt-6 space-y-5" onSubmit={handleSubmit}>
          {viewerIsAdmin ? (
            <label className="space-y-2">
              <span className="text-sm font-medium text-foreground">Member</span>
              <select
                value={formMembershipId}
                onChange={(event) => setFormMembershipId(event.target.value)}
                className={selectClassName}
                disabled={isSubmitting}
              >
                {activeMembers.map((member) => (
                  <option key={member.membershipId} value={member.membershipId}>
                    {member.name}
                  </option>
                ))}
              </select>
            </label>
          ) : (
            <div className="rounded-[1.5rem] border border-border/70 bg-[#f8f6f1] px-4 py-3">
              <div className="text-xs uppercase tracking-[0.18em] text-muted-foreground">
                Member
              </div>
              <div className="mt-2 text-lg font-medium text-foreground">
                {viewerMember?.name}
              </div>
            </div>
          )}

          <label className="space-y-2">
            <span className="text-sm font-medium text-foreground">Amount</span>
            <UnitInput
              type="number"
              name="amount"
              min="0.01"
              step="0.01"
              placeholder="75"
              unit="USD"
              value={amount}
              onChange={(event) => setAmount(event.target.value)}
              disabled={isSubmitting}
              required
            />
          </label>

          <label className="space-y-2">
            <span className="text-sm font-medium text-foreground">Contribution date</span>
            <Input
              type="date"
              name="contributedOn"
              value={contributedOn}
              onChange={(event) => setContributedOn(event.target.value)}
              className="h-11 rounded-xl border-border/70 bg-white/85 px-3"
              disabled={isSubmitting}
              required
            />
          </label>

          {formError ? <StatusBanner tone="destructive" message={formError} /> : null}
          {successMessage ? <StatusBanner tone="default" message={successMessage} /> : null}

          <Button
            type="submit"
            size="lg"
            disabled={isSubmitting}
            className="h-11 w-full rounded-xl bg-primary text-primary-foreground shadow-[0_12px_35px_rgba(16,82,52,0.22)]"
          >
            {isSubmitting ? "Logging contribution..." : "Log contribution"}
          </Button>
        </form>
      </div>

      <div className="px-6 py-6 md:px-8">
        <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <h2 className="text-2xl font-semibold tracking-tight">Contribution history</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Review monthly contribution totals and the individual entries behind them.
            </p>
          </div>

          <label className="space-y-2 md:w-64">
            <span className="text-sm font-medium text-foreground">Selected member</span>
            <select
              value={selectedMembershipId}
              onChange={(event) => setSelectedMembershipId(event.target.value)}
              className={selectClassName}
            >
              {dashboard.members.map((member) => (
                <option key={member.membershipId} value={member.membershipId}>
                  {member.name}
                </option>
              ))}
            </select>
          </label>
        </div>

        {selectedMember ? (
          <div className="mt-6 rounded-[1.75rem] border border-border/70 bg-[#f8f6f1] px-5 py-4">
            <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
              <div>
                <div className="text-lg font-semibold text-foreground">
                  {selectedMember.name}
                </div>
                <div className="mt-1 text-sm text-muted-foreground">
                  {selectedMember.email}
                </div>
                <div className="mt-3 flex flex-wrap gap-2">
                  <Badge variant={selectedMember.role === "ADMIN" ? "default" : "outline"}>
                    {formatEnumLabel(selectedMember.role)}
                  </Badge>
                  <Badge
                    variant={
                      selectedMember.status === "ACTIVE"
                        ? "default"
                        : selectedMember.status === "SUSPENDED"
                          ? "destructive"
                        : "outline"
                    }
                  >
                    {formatEnumLabel(selectedMember.status)}
                  </Badge>
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <div className="text-xs uppercase tracking-[0.18em] text-muted-foreground">
                    This month
                  </div>
                  <div className="mt-2 text-2xl font-semibold">
                    {selectedMember.currentContributionTotalFormatted}
                  </div>
                </div>
                <div>
                  <div className="text-xs uppercase tracking-[0.18em] text-muted-foreground">
                    Remaining
                  </div>
                  <div className="mt-2 text-2xl font-semibold">
                    {selectedMember.currentContributionRemainingFormatted}
                  </div>
                </div>
              </div>
            </div>
          </div>
        ) : null}

        {historyError ? (
          <div className="mt-6">
            <StatusBanner tone="destructive" message={historyError} />
          </div>
        ) : null}

        {isLoadingHistory ? (
          <div className="mt-6 rounded-[1.75rem] border border-border/70 bg-white/65 px-5 py-6 text-sm text-muted-foreground">
            Loading contribution history...
          </div>
        ) : null}

        {!isLoadingHistory && history && history.periods.length === 0 ? (
          <div className="mt-6 rounded-[1.75rem] border border-border/70 bg-white/65 px-5 py-6 text-sm text-muted-foreground">
            No contributions have been logged for this member yet.
          </div>
        ) : null}

        {!isLoadingHistory && history && history.periods.length > 0 ? (
          <div className="mt-6 space-y-4">
            {history.periods.map((period) => (
              <div
                key={period.periodStart}
                className="overflow-hidden rounded-[1.75rem] border border-border/70 bg-white/80"
              >
                <div className="grid gap-px border-b border-border/70 bg-[#e6ece8] md:grid-cols-3">
                  <div className="bg-[#fbfaf6] px-5 py-4">
                    <div className="text-xs uppercase tracking-[0.18em] text-muted-foreground">
                      Period
                    </div>
                    <div className="mt-2 text-xl font-semibold">{period.label}</div>
                  </div>
                  <div className="bg-[#fbfaf6] px-5 py-4">
                    <div className="text-xs uppercase tracking-[0.18em] text-muted-foreground">
                      Total contributed
                    </div>
                    <div className="mt-2 text-xl font-semibold">
                      {period.totalAmountFormatted}
                    </div>
                  </div>
                  <div className="bg-[#fbfaf6] px-5 py-4">
                    <div className="text-xs uppercase tracking-[0.18em] text-muted-foreground">
                      Remaining to minimum
                    </div>
                    <div className="mt-2 text-xl font-semibold">
                      {period.remainingAmountFormatted}
                    </div>
                  </div>
                </div>

                <div className="px-5 py-4">
                  <div className="mb-4 text-sm text-muted-foreground">
                    Minimum target: {period.minimumTargetFormatted}
                  </div>
                  <div className="space-y-3">
                    {period.entries.map((entry) => (
                      <div
                        key={entry.id}
                        className="flex flex-col gap-3 rounded-[1.25rem] border border-border/70 bg-[#fbfaf6] px-4 py-3 md:flex-row md:items-center md:justify-between"
                      >
                        <div>
                          <div className="text-lg font-semibold text-foreground">
                            {entry.amountFormatted}
                          </div>
                          <div className="mt-1 text-sm text-muted-foreground">
                            Contributed on {formatDateLabel(entry.contributedOn)}
                          </div>
                        </div>
                        <div className="text-sm text-muted-foreground md:text-right">
                          <div>Recorded by {entry.recordedBy.name}</div>
                          <div>
                            Logged{" "}
                            {new Date(entry.recordedAt).toLocaleDateString("en-US", {
                              month: "short",
                              day: "numeric",
                              year: "numeric",
                            })}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : null}
      </div>
    </section>
  );
}
