CREATE TABLE "Contribution" (
    "id" TEXT NOT NULL,
    "circleId" TEXT NOT NULL,
    "membershipId" TEXT NOT NULL,
    "recordedByUserId" TEXT NOT NULL,
    "amountCents" INTEGER NOT NULL,
    "contributedOn" DATE NOT NULL,
    "periodStart" DATE NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Contribution_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "Contribution_circleId_periodStart_idx" ON "Contribution"("circleId", "periodStart");
CREATE INDEX "Contribution_membershipId_periodStart_idx" ON "Contribution"("membershipId", "periodStart");
CREATE INDEX "Contribution_recordedByUserId_idx" ON "Contribution"("recordedByUserId");

ALTER TABLE "Contribution"
ADD CONSTRAINT "Contribution_circleId_fkey" FOREIGN KEY ("circleId") REFERENCES "Circle"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "Contribution"
ADD CONSTRAINT "Contribution_membershipId_fkey" FOREIGN KEY ("membershipId") REFERENCES "CircleMembership"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "Contribution"
ADD CONSTRAINT "Contribution_recordedByUserId_fkey" FOREIGN KEY ("recordedByUserId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
