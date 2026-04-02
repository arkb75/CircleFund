import { z } from "zod";

export const membershipRoles = ["ADMIN", "MEMBER"] as const;
export const membershipStatuses = ["ACTIVE", "PENDING", "SUSPENDED"] as const;
export const approvalModes = [
  "ADMIN_ONLY",
  "REVIEWER_VOTE",
  "REVIEWER_VOTE_ADMIN_FINALIZE",
] as const;

export const createCircleRequestSchema = z.object({
  name: z.string().trim().min(2).max(80),
  approvalMode: z.enum(approvalModes),
  minimumMonthlyContribution: z.number().finite().positive().max(1_000_000),
  minimumReserveBalance: z.number().finite().min(0).max(1_000_000),
  minimumMembershipDurationMonths: z.number().int().positive().max(120).optional(),
  maxActiveLoansPerMember: z.number().int().positive().max(25).optional(),
  maxRepaymentTermMonths: z.number().int().positive().max(120).optional(),
});

export const joinCircleRequestSchema = z.object({
  inviteCode: z.string().trim().min(4).max(24),
});

export type CreateCircleRequest = z.infer<typeof createCircleRequestSchema>;
export type JoinCircleRequest = z.infer<typeof joinCircleRequestSchema>;
