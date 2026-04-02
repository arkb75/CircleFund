ALTER TABLE "CircleRule"
ADD COLUMN "minimumMonthlyContributionCents" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN "minimumReserveBalanceCents" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN "requireGoodStandingToBorrow" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN "minimumMembershipDurationMonths" INTEGER,
ADD COLUMN "maxActiveLoansPerMember" INTEGER,
ADD COLUMN "maxRepaymentTermMonths" INTEGER;

ALTER TABLE "CircleRule"
DROP COLUMN "contributionAmountCents",
DROP COLUMN "contributionFrequency",
DROP COLUMN "maxLoanSizeCents";

ALTER TABLE "CircleRule"
ALTER COLUMN "minimumMonthlyContributionCents" DROP DEFAULT,
ALTER COLUMN "minimumReserveBalanceCents" DROP DEFAULT,
ALTER COLUMN "requireGoodStandingToBorrow" DROP DEFAULT;
