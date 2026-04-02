import { z } from "zod";

export const accountProfileSchema = z.object({
  name: z.string().trim().min(2).max(80),
  email: z.string().trim().email().max(120),
});

export const signUpRequestSchema = accountProfileSchema.extend({
  inviteCode: z.string().trim().max(24).optional().or(z.literal("")),
});

export const loginRequestSchema = z.object({
  email: z.string().trim().email().max(120),
});

export type SignUpRequest = z.infer<typeof signUpRequestSchema>;
export type LoginRequest = z.infer<typeof loginRequestSchema>;
