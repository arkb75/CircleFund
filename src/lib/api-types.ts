import {
  approvalModes,
  membershipRoles,
  membershipStatuses,
} from "@/lib/validations/circles";

type ApprovalMode = (typeof approvalModes)[number];
type MembershipRole = (typeof membershipRoles)[number];
type MembershipStatus = (typeof membershipStatuses)[number];

export type CircleRedirectResponse = {
  circle: {
    id: string;
    name: string;
    inviteCode: string;
  };
  redirectTo: string;
};

export type AuthRedirectResponse = {
  redirectTo: string;
};

export type CircleDashboardResponse = {
  circle: {
    id: string;
    name: string;
    inviteCode: string;
    currentContributionPeriodStart: string;
    currentContributionPeriodLabel: string;
    approvalMode: ApprovalMode;
    minimumMonthlyContribution: number;
    minimumMonthlyContributionFormatted: string;
    minimumReserveBalance: number;
    minimumReserveBalanceFormatted: string;
    minimumMembershipDurationMonths: number | null;
    maxActiveLoansPerMember: number | null;
    maxRepaymentTermMonths: number | null;
    memberCount: number;
  };
  viewerMembership: {
    membershipId: string;
    role: MembershipRole;
    status: MembershipStatus;
  };
  members: Array<{
    membershipId: string;
    id: string;
    name: string;
    email: string;
    role: MembershipRole;
    status: MembershipStatus;
    joinedAt: string;
    currentContributionTotal: number;
    currentContributionTotalFormatted: string;
    currentContributionRemaining: number;
    currentContributionRemainingFormatted: string;
  }>;
};

export type ContributionCreateResponse = {
  contribution: {
    id: string;
    membershipId: string;
    amount: number;
    amountFormatted: string;
    contributedOn: string;
    periodStart: string;
    createdAt: string;
  };
};

export type ContributionHistoryResponse = {
  member: {
    membershipId: string;
    id: string;
    name: string;
    email: string;
    role: MembershipRole;
    status: MembershipStatus;
  };
  periods: Array<{
    periodStart: string;
    label: string;
    totalAmount: number;
    totalAmountFormatted: string;
    minimumTarget: number;
    minimumTargetFormatted: string;
    remainingAmount: number;
    remainingAmountFormatted: string;
    entries: Array<{
      id: string;
      amount: number;
      amountFormatted: string;
      contributedOn: string;
      recordedAt: string;
      recordedBy: {
        id: string;
        name: string;
      };
    }>;
  }>;
};
