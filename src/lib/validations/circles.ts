import { z } from "zod";

export const membershipRoles = ["ADMIN", "MEMBER"] as const;
export const membershipStatuses = ["ACTIVE", "PENDING", "SUSPENDED"] as const;
export const contributionFrequencies = ["WEEKLY", "BIWEEKLY", "MONTHLY"] as const;
export const approvalModes = [
  "ADMIN_ONLY",
  "REVIEWER_VOTE",
  "REVIEWER_VOTE_ADMIN_FINALIZE",
] as const;

const userSchema = z.object({
  name: z.string().trim().min(2).max(80),
  email: z.string().trim().email().max(120),
});

export const createCircleRequestSchema = z.object({
  user: userSchema,
  circle: z.object({
    name: z.string().trim().min(2).max(80),
    contributionAmount: z.number().finite().positive().max(1_000_000),
    contributionFrequency: z.enum(contributionFrequencies),
    maxLoanSize: z.number().finite().positive().max(1_000_000),
    approvalMode: z.enum(approvalModes),
  }),
});

export const joinCircleRequestSchema = z.object({
  user: userSchema,
  inviteCode: z.string().trim().min(4).max(24),
});

export type CreateCircleRequest = z.infer<typeof createCircleRequestSchema>;
export type JoinCircleRequest = z.infer<typeof joinCircleRequestSchema>;
