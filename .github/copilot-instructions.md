# TestersPlaybook AI Agent Instructions

## Project Overview

A lightweight QA test case and bug management system for individual developers, freelance QA engineers, and small teams. **Not an enterprise tool** — prioritizes simplicity over complexity, with AI-assisted test case generation and review.

## Architecture

**Next.js 14+ App Router** with server-side rendering:

- **Framework**: Next.js 16.1.1 with TypeScript
- **Database**: PostgreSQL via Prisma ORM
- **Auth**: NextAuth v4 with Google OAuth + PrismaAdapter
- **AI**: OpenAI GPT-3.5 for test case generation, review, and module analysis
- **Styling**: Tailwind CSS 4

### Data Model Hierarchy

```
User
  ↳ Project (owned)
      ↳ ProjectMember (OWNER | CONTRIBUTOR)
      ↳ Module
          ↳ TestCase (manual/automation)
      ↳ TestRun
          ↳ TestResult (PASSED/FAILED/BLOCKED)
      ↳ Bug
      ↳ Invitation
```

**Key relationships** (see [prisma/schema.prisma](prisma/schema.prisma)):

- All entities cascade delete when parent is removed (e.g., deleting a Module deletes all its TestCases).
- TestCases link to Modules (optional) and always to Projects.
- AutomationRef is 1:1 with TestCase for linking to automation repo.

## Critical Patterns

### 1. Authentication & Authorization

**Always follow this pattern in API routes:**

```typescript
import { getAuthSession } from "@/lib/auth";
import { getProjectMember } from "@/lib/project-access";

// Check session
const session = await getAuthSession();
if (!session?.user?.id) {
  return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
}

// Check project access
const role = await getProjectMember(projectId, session.user.id);
if (!role) {
  # TestersPlaybook AI Agent Instructions

  This file captures the essential, project-specific rules an AI coding agent needs to be productive.

  Project snapshot
  - Next.js App Router + TypeScript, server-rendered pages, Tailwind styling.
  - PostgreSQL via Prisma; auth via NextAuth v4 (Google); AI features call OpenAI.

  Quick start (common commands)
  - `npm run dev` — start dev server.
  - `npx prisma generate` — regenerate client.
  - `npx prisma migrate dev` — run migrations.

  Auth & API rule (must follow)
  - Always validate session and project membership in API routes. Pattern example:
  ```ts
  const session = await getAuthSession();
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const role = await getProjectMember(projectId, session.user.id);
  if (!role) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  ```
  See `lib/auth.ts` and `lib/project-access.ts` for helpers.

  Route handler pattern
  - Dynamic route handlers must `await context.params` (Next.js 15+). See `app/api/projects/[projectId]/modules/route.ts`.

  AI integration (concise)
  - Features: generate/improve/analyze test cases. Limits enforced per-user (`generate`, `improve`, `analyze`).
  - Workflow: check usage limits → fetch data via Prisma → build prompt (lib/ai/prompts) → call OpenAI (lib/ai/client.ts) → parse JSON responses.
  - All AI prompts return structured JSON (not free text); see `lib/ai/actions/testcase.ts` and `lib/ai/usage.ts`.

  Prisma & models
  - Always import the shared client: `import prisma from '@/lib/prisma'`.
  - Use `include` for relations. TestCase `steps` is a JSON array; `tags` is `String[]`.

  Conventions & gotchas
  - Route handlers export `export const runtime = "nodejs";`.
  - Human-in-the-loop: AI outputs are suggestions and must be reviewed before committing.
  - Keep module/testcase folder structure flat per `prisma/schema.prisma`.

  Key files to inspect
  - Auth: `app/api/auth/[...nextauth]/route.ts`
  - Project access: `lib/project-access.ts`
  - Shared Prisma client: `lib/prisma.ts`
  - AI actions: `lib/ai/actions/testcase.ts`
  - Example route pattern: `app/api/projects/[projectId]/modules/route.ts`

  If anything here is unclear or you want more examples (API handlers, UI components, or AI prompt shapes), tell me which area and I will expand with concrete snippets.