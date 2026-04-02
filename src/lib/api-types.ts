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
    role: MembershipRole;
    status: MembershipStatus;
  };
  members: Array<{
    id: string;
    name: string;
    email: string;
    role: MembershipRole;
    status: MembershipStatus;
    joinedAt: string;
  }>;
};
