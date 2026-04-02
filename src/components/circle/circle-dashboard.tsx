import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ContributionWorkspace } from "@/components/circle/contribution-workspace";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type { CircleDashboardResponse } from "@/lib/api-types";
import { formatEnumLabel } from "@/lib/strings";

function toneForRole(role: string) {
  return role === "ADMIN" ? "default" : "outline";
}

function toneForStatus(status: string) {
  if (status === "ACTIVE") {
    return "default";
  }

  if (status === "SUSPENDED") {
    return "destructive";
  }

  return "outline";
}

function formatOptionalLimit(
  value: number | null,
  singularLabel: string,
  pluralLabel: string,
  emptyLabel = "Not set",
) {
  if (value === null) {
    return emptyLabel;
  }

  return `${value} ${value === 1 ? singularLabel : pluralLabel}`;
}

export function CircleDashboard({
  dashboard,
}: {
  dashboard: CircleDashboardResponse;
}) {
  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top_left,_rgba(37,99,63,0.14),_transparent_30%),linear-gradient(180deg,#faf8f2_0%,#f4f7f5_100%)] px-6 py-8 text-foreground md:px-10">
      <div className="mx-auto max-w-6xl">
        <div className="overflow-hidden rounded-[2.25rem] border border-white/80 bg-white/75 shadow-[0_24px_100px_rgba(15,23,42,0.12)] backdrop-blur">
          <section className="relative overflow-hidden border-b border-border/70 px-6 py-8 md:px-8 md:py-10">
            <div className="absolute inset-y-0 right-0 hidden w-1/3 bg-[radial-gradient(circle_at_center,_rgba(16,82,52,0.12),_transparent_70%)] lg:block" />
            <div className="relative flex flex-col gap-8 lg:flex-row lg:items-end lg:justify-between">
              <div className="space-y-4">
                <div className="flex flex-wrap items-center gap-3">
                  <Badge className="bg-primary/10 text-primary hover:bg-primary/10">
                    Private lending circle
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
                <div className="space-y-3">
                  <h1 className="font-heading text-4xl font-semibold tracking-tight md:text-5xl">
                    {dashboard.circle.name}
                  </h1>
                <p className="max-w-2xl text-sm leading-7 text-muted-foreground md:text-base">
                    Track contributions, review who is current for the month, and keep
                    the circle roster organized in one workspace.
                </p>
              </div>
            </div>

              <div className="rounded-[1.75rem] border border-primary/15 bg-primary/8 px-5 py-4">
                <div className="text-xs uppercase tracking-[0.22em] text-primary/70">
                  Invite code
                </div>
                <div className="mt-2 font-mono text-3xl font-semibold tracking-[0.28em] text-primary">
                  {dashboard.circle.inviteCode}
                </div>
              </div>
            </div>
          </section>

          <section className="grid gap-0 border-b border-border/70 lg:grid-cols-[1.15fr_0.85fr]">
            <div className="grid gap-0 border-b border-border/70 sm:grid-cols-2 xl:grid-cols-2 lg:border-b-0 lg:border-r">
              <div className="border-b border-border/70 px-6 py-5 sm:border-r xl:border-b-0">
                <div className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
                  Approval mode
                </div>
                <div className="mt-3 max-w-xs text-lg font-medium">
                  {formatEnumLabel(dashboard.circle.approvalMode)}
                </div>
              </div>
              <div className="border-b border-border/70 px-6 py-5 xl:border-r xl:border-b-0">
                <div className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
                  Minimum monthly contribution
                </div>
                <div className="mt-3 text-2xl font-semibold">
                  {dashboard.circle.minimumMonthlyContributionFormatted}
                </div>
              </div>
              <div className="border-b border-border/70 px-6 py-5 sm:border-r xl:border-r-0">
                <div className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
                  Minimum reserve balance
                </div>
                <div className="mt-3 text-2xl font-semibold">
                  {dashboard.circle.minimumReserveBalanceFormatted}
                </div>
              </div>
              <div className="border-b border-border/70 px-6 py-5 sm:border-r">
                <div className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
                  Minimum membership duration
                </div>
                <div className="mt-3 text-2xl font-semibold">
                  {formatOptionalLimit(
                    dashboard.circle.minimumMembershipDurationMonths,
                    "month",
                    "months",
                  )}
                </div>
              </div>
              <div className="px-6 py-5">
                <div className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
                  Max repayment term
                </div>
                <div className="mt-3 text-2xl font-semibold">
                  {formatOptionalLimit(
                    dashboard.circle.maxRepaymentTermMonths,
                    "month",
                    "months",
                  )}
                </div>
              </div>
            </div>

            <div className="flex flex-col justify-between gap-4 px-6 py-5">
              <div>
                <div className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
                  Your access
                </div>
                <div className="mt-3 flex flex-wrap gap-2">
                  <Badge variant={toneForRole(dashboard.viewerMembership.role)}>
                    {formatEnumLabel(dashboard.viewerMembership.role)}
                  </Badge>
                  <Badge variant={toneForStatus(dashboard.viewerMembership.status)}>
                    {formatEnumLabel(dashboard.viewerMembership.status)}
                  </Badge>
                </div>
              </div>
              <div>
                <div className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
                  Members
                </div>
                <div className="mt-3 text-3xl font-semibold">
                  {dashboard.circle.memberCount}
                </div>
              </div>
              <div>
                <div className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
                  Current contribution period
                </div>
                <div className="mt-3 text-2xl font-semibold">
                  {dashboard.circle.currentContributionPeriodLabel}
                </div>
              </div>
              <div>
                <div className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
                  Max active loans
                </div>
                <div className="mt-3 text-3xl font-semibold">
                  {formatOptionalLimit(
                    dashboard.circle.maxActiveLoansPerMember,
                    "loan",
                    "loans",
                  )}
                </div>
              </div>
            </div>
          </section>

          <ContributionWorkspace dashboard={dashboard} />

          <section className="px-6 py-6 md:px-8 md:py-8">
            <div className="flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
              <div>
                <h2 className="text-2xl font-semibold tracking-tight">Member roster</h2>
                <p className="mt-1 text-sm text-muted-foreground">
                  Current circle members with this month&apos;s contribution progress.
                </p>
              </div>
            </div>

            <div className="mt-6 overflow-hidden rounded-[1.75rem] border border-border/70">
              <Table>
                <TableHeader className="bg-[#f6f4ee]">
                  <TableRow className="hover:bg-[#f6f4ee]">
                    <TableHead className="px-4 py-3">Member</TableHead>
                    <TableHead className="px-4 py-3">Role</TableHead>
                    <TableHead className="px-4 py-3">Status</TableHead>
                    <TableHead className="px-4 py-3">This Month</TableHead>
                    <TableHead className="px-4 py-3">Remaining</TableHead>
                    <TableHead className="px-4 py-3">Joined</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {dashboard.members.map((member) => (
                    <TableRow key={member.id}>
                      <TableCell className="px-4 py-4">
                        <div className="space-y-1">
                          <div className="font-medium">{member.name}</div>
                          <div className="text-sm text-muted-foreground">
                            {member.email}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="px-4 py-4">
                        <Badge variant={toneForRole(member.role)}>
                          {formatEnumLabel(member.role)}
                        </Badge>
                      </TableCell>
                      <TableCell className="px-4 py-4">
                        <Badge variant={toneForStatus(member.status)}>
                          {formatEnumLabel(member.status)}
                        </Badge>
                      </TableCell>
                      <TableCell className="px-4 py-4 text-sm font-medium">
                        {member.currentContributionTotalFormatted}
                      </TableCell>
                      <TableCell className="px-4 py-4 text-sm font-medium">
                        {member.currentContributionRemainingFormatted}
                      </TableCell>
                      <TableCell className="px-4 py-4 text-sm text-muted-foreground">
                        {new Date(member.joinedAt).toLocaleDateString("en-US", {
                          month: "short",
                          day: "numeric",
                          year: "numeric",
                        })}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </section>
        </div>
      </div>
    </main>
  );
}
