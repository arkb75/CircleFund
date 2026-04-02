import {
  approvalModes,
  contributionFrequencies,
  membershipRoles,
  membershipStatuses,
} from "@/lib/validations/circles";

type ContributionFrequency = (typeof contributionFrequencies)[number];
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
    contributionAmount: number;
    contributionAmountFormatted: string;
    contributionFrequency: ContributionFrequency;
    maxLoanSize: number;
    maxLoanSizeFormatted: string;
    approvalMode: ApprovalMode;
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
