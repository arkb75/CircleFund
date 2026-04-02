import { z } from "zod";

import { isValidDateOnlyString } from "@/lib/contribution-periods";

export const createContributionRequestSchema = z.object({
  membershipId: z.string().trim().min(1).max(80),
  amount: z.number().finite().positive().max(1_000_000),
  contributedOn: z
    .string()
    .trim()
    .refine(isValidDateOnlyString, "Contribution date must be a valid YYYY-MM-DD value."),
});

export const contributionHistoryQuerySchema = z.object({
  membershipId: z.string().trim().min(1).max(80),
});

export type CreateContributionRequest = z.infer<typeof createContributionRequestSchema>;
export type ContributionHistoryQuery = z.infer<typeof contributionHistoryQuerySchema>;
