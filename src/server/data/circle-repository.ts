import type {
  ApprovalMode,
  MembershipRole,
  MembershipStatus,
  Prisma,
  PrismaClient,
} from "@/generated/prisma/client";

type DatabaseClient = PrismaClient | Prisma.TransactionClient;

export async function upsertUser(
  db: DatabaseClient,
  input: {
    email: string;
    name: string;
  },
) {
  return db.user.upsert({
    where: { email: input.email },
    update: { name: input.name },
    create: input,
    select: {
      id: true,
      email: true,
      name: true,
    },
  });
}

export async function findUserByEmail(db: DatabaseClient, email: string) {
  return db.user.findUnique({
    where: { email },
    select: {
      id: true,
      email: true,
      name: true,
    },
  });
}

export async function createCircle(
  db: DatabaseClient,
  input: {
    name: string;
    inviteCode: string;
    createdById: string;
  },
) {
  return db.circle.create({
    data: input,
    select: {
      id: true,
      name: true,
      inviteCode: true,
    },
  });
}

export async function createCircleRule(
  db: DatabaseClient,
  input: {
    circleId: string;
    approvalMode: ApprovalMode;
    minimumMonthlyContributionCents: number;
    minimumReserveBalanceCents: number;
    minimumMembershipDurationMonths?: number;
    maxActiveLoansPerMember?: number;
    maxRepaymentTermMonths?: number;
  },
) {
  return db.circleRule.create({
    data: input,
  });
}

export async function createMembership(
  db: DatabaseClient,
  input: {
    circleId: string;
    userId: string;
    role: MembershipRole;
    status: MembershipStatus;
  },
) {
  return db.circleMembership.create({
    data: input,
    select: {
      id: true,
      circleId: true,
      role: true,
      status: true,
    },
  });
}

export async function findCircleByInviteCode(db: DatabaseClient, inviteCode: string) {
  return db.circle.findUnique({
    where: { inviteCode },
    select: {
      id: true,
      name: true,
      inviteCode: true,
    },
  });
}

export async function findMembershipForCircleUser(
  db: DatabaseClient,
  circleId: string,
  userId: string,
) {
  return db.circleMembership.findUnique({
    where: {
      circleId_userId: {
        circleId,
        userId,
      },
    },
    select: {
      id: true,
      circleId: true,
      userId: true,
      role: true,
      status: true,
      createdAt: true,
    },
  });
}

export async function findCircleMembershipById(
  db: DatabaseClient,
  circleId: string,
  membershipId: string,
) {
  return db.circleMembership.findFirst({
    where: {
      id: membershipId,
      circleId,
    },
    select: {
      id: true,
      circleId: true,
      userId: true,
      role: true,
      status: true,
      createdAt: true,
      user: {
        select: {
          id: true,
          name: true,
          email: true,
        },
      },
      circle: {
        select: {
          rule: {
            select: {
              minimumMonthlyContributionCents: true,
            },
          },
        },
      },
    },
  });
}

export async function createContribution(
  db: DatabaseClient,
  input: {
    circleId: string;
    membershipId: string;
    recordedByUserId: string;
    amountCents: number;
    contributedOn: Date;
    periodStart: Date;
  },
) {
  return db.contribution.create({
    data: input,
    select: {
      id: true,
      membershipId: true,
      amountCents: true,
      contributedOn: true,
      periodStart: true,
      createdAt: true,
    },
  });
}

export async function findContributionHistoryForMembership(
  db: DatabaseClient,
  circleId: string,
  membershipId: string,
) {
  return db.contribution.findMany({
    where: {
      circleId,
      membershipId,
    },
    orderBy: [{ periodStart: "desc" }, { contributedOn: "desc" }, { createdAt: "desc" }],
    select: {
      id: true,
      amountCents: true,
      contributedOn: true,
      periodStart: true,
      createdAt: true,
      recordedByUser: {
        select: {
          id: true,
          name: true,
        },
      },
    },
  });
}

export async function findLatestMembershipForUser(db: DatabaseClient, userId: string) {
  return db.circleMembership.findFirst({
    where: {
      userId,
    },
    orderBy: [{ updatedAt: "desc" }, { createdAt: "desc" }],
    select: {
      circleId: true,
      status: true,
    },
  });
}

export async function findCircleDashboard(
  db: DatabaseClient,
  circleId: string,
  currentPeriodStart: Date,
) {
  return db.circle.findUnique({
    where: { id: circleId },
    select: {
      id: true,
      name: true,
      inviteCode: true,
      rule: {
        select: {
          approvalMode: true,
          minimumMonthlyContributionCents: true,
          minimumReserveBalanceCents: true,
          minimumMembershipDurationMonths: true,
          maxActiveLoansPerMember: true,
          maxRepaymentTermMonths: true,
        },
      },
      memberships: {
        orderBy: [{ createdAt: "asc" }],
        select: {
          id: true,
          role: true,
          status: true,
          createdAt: true,
          userId: true,
          contributions: {
            where: {
              periodStart: currentPeriodStart,
            },
            select: {
              amountCents: true,
            },
          },
          user: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
        },
      },
    },
  });
}
