# CircleFund

A full-stack prototype for invite-only savings and lending circles. Members can join a circle, record contributions and review monthly progress; admins can configure circle rules and record contributions for members.

Built with **Next.js 16, TypeScript, React 19, Tailwind CSS 4, Prisma 7 and PostgreSQL**, with **Vitest** tests for API routes and contribution calculations.

## What works

- Account creation, email-based demo sign-in and signed HTTP-only session cookies.
- Account-first onboarding: create a circle or join one with an invite code.
- Circle policies for monthly contribution targets, reserves, membership duration and future lending limits.
- Member dashboard with roles, membership status, monthly contribution totals and remaining targets.
- Manual contribution entry with admin/member permission checks and validated dates and amounts.
- Per-member contribution history grouped by calendar month, including who recorded each entry.

## Engineering details

| Area | Implementation |
| --- | --- |
| Application | Next.js App Router with a versioned REST API |
| Business logic | Separate service and repository layers |
| Validation | Zod request schemas and structured API errors |
| Persistence | Prisma migrations, relational membership constraints and PostgreSQL transactions |
| Money and dates | Integer cents for storage; date-only contribution records and UTC monthly periods |
| Tests | Vitest route tests plus date parsing and contribution analytics tests |

Useful starting points for a code review:

- [Contribution service](src/server/services/contribution-service.ts): membership checks, recording permissions and transaction handling.
- [Contribution analytics](src/server/services/contribution-analytics.ts) and [tests](src/server/services/contribution-analytics.test.ts): monthly totals and history grouping.
- [Database schema](prisma/schema.prisma): users, circles, policies, memberships and contributions.
- [API route tests](src/app/api/v1): request validation, session requirements, redirects and error responses.
- [Contribution workspace](src/components/circle/contribution-workspace.tsx): entry forms and member history.

## Run locally

Requirements: Node.js and npm, plus a PostgreSQL database. The project is configured for Neon PostgreSQL.

1. Create a `.env` file in the repository root:

   ```dotenv
   DATABASE_URL="your-pooled-postgresql-connection-string"
   DIRECT_URL="your-direct-postgresql-connection-string"
   SESSION_SECRET="replace-with-a-long-random-secret"
   ```

   `DATABASE_URL` is used by the application; `DIRECT_URL` is used by Prisma migrations. Keep this file out of version control.

2. Install dependencies and generate the Prisma client:

   ```bash
   npm ci
   ```

3. Apply the committed migrations to your development database:

   ```bash
   npm run db:deploy
   ```

4. Start the app:

   ```bash
   npm run dev
   ```

5. Open [localhost:3000](http://localhost:3000), create an account and create a circle. Use its invite code to join from a second demo account.

For iterative schema development, use `npm run db:migrate`. Other database tools are `npm run db:generate`, `npm run db:validate` and `npm run db:studio`.

## Checks

```bash
npm test
npm run lint
npm run build
```

The route tests mock the service layer; they are not end-to-end database tests.

## API

| Method | Route | Purpose |
| --- | --- | --- |
| POST | `/api/v1/auth/signup` | Create an account and optionally join by invite |
| POST | `/api/v1/auth/login` | Start a demo session |
| POST | `/api/v1/circles` | Create a circle |
| POST | `/api/v1/circles/join` | Join a circle by invite code |
| GET | `/api/v1/circles/:circleId` | Load the member dashboard |
| POST | `/api/v1/circles/:circleId/contributions` | Record a contribution |
| GET | `/api/v1/circles/:circleId/contributions?membershipId=...` | Read a member's contribution history |
| POST | `/api/v1/session/logout` | Clear the session and redirect home |

## Prototype scope

Sign-in currently uses an email address without password or email-ownership verification. Replace this demo authentication before using real accounts or financial data.

Contributions are manual records; the app does not move money. Loan approval, payouts and repayments are future work. Invite-code joins create active memberships immediately, and amounts are currently displayed in USD.
