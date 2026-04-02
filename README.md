# CircleFund

CircleFund is a private lending-circle / ROSCA intelligence MVP built for invite-only community groups. This scaffold now supports account-first access, authenticated circle onboarding, a REST API layer, and a placeholder circle dashboard.

## Stack

- Next.js 16 App Router + TypeScript
- Tailwind CSS 4
- shadcn/ui
- Prisma 7
- Neon Postgres
- Vitest for route-level API tests

## MVP Features

- Create an account with an optional invite code
- Sign in with an existing email-based MVP account
- Continue authenticated users into onboarding when they do not belong to a circle yet
- Create a circle with contribution rules, approval mode, admin membership, and invite code
- Join a circle by invite code after account creation or during signup
- Cookie-backed MVP session handling
- Logout endpoint and signed-in logout actions
- Protected circle dashboard backed by `/api/v1`
- Prisma schema designed to extend into future contribution, loan, review, and repayment models

## Data Model

Current Prisma models:

- `User`
- `Circle`
- `CircleRule`
- `CircleMembership`

Current enums:

- `MembershipRole`
- `MembershipStatus`
- `ContributionFrequency`
- `ApprovalMode`

## Local Setup

1. Install dependencies:

   ```bash
   npm install
   ```

2. Copy the example env file and add your Neon connection strings:

   ```bash
   cp .env.example .env
   ```

3. Update `.env`:

   - `DATABASE_URL`: Neon pooled connection string used by the app at runtime
   - `DIRECT_URL`: Neon direct connection string used by Prisma CLI and migrations
   - `SESSION_SECRET`: any long random string for signed cookie sessions

4. Apply the initial Prisma migration to your database:

   ```bash
   npm run db:deploy
   ```

   For local iterative schema work, use:

   ```bash
   npm run db:migrate
   ```

5. Start the app:

   ```bash
   npm run dev
   ```

6. Open `http://localhost:3000`

## Useful Commands

```bash
npm run lint
npm test
npm run build
npm run db:validate
npm run db:generate
npm run db:deploy
npm run db:studio
```

## API Surface

- `POST /api/v1/auth/signup`
- `POST /api/v1/auth/login`
- `POST /api/v1/circles`
- `POST /api/v1/circles/join`
- `GET /api/v1/circles/:circleId`
- `POST /api/v1/session/logout`

All endpoints return JSON except logout, which redirects after clearing the cookie. The auth endpoints set an httpOnly signed session cookie for the current user.

## Notes

- Money is stored as integer cents in the database and formatted as USD in the UI/API responses.
- Invite-code joins create `ACTIVE` memberships immediately for this MVP.
- The landing page is account-first. Circle creation and invite joining now live in the signed-in `/onboarding` flow.
- Prisma CLI uses `DIRECT_URL` in `prisma.config.ts`, which matches the current Prisma 7 config pattern for Postgres migrations.
