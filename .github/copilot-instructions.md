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
  return NextResponse.json({ error: "Forbidden" }, { status: 403 });
}
```

**Authorization rules** (see [docs/AUTH_MODEL.md](docs/AUTH_MODEL.md)):

- `OWNER`: Full project control (delete, billing, invitations).
- `CONTRIBUTOR`: Create/edit test cases, runs, and bugs only.

Use helper functions in [lib/permissions.ts](lib/permissions.ts):

- `canEditProject(role)` — returns true for OWNER or CONTRIBUTOR.
- `canDeleteProject(role)` — returns true for OWNER only.

### 2. Next.js 15+ Route Handler Params

**CRITICAL**: Always `await context.params` in dynamic routes:

```typescript
export async function POST(
  request: NextRequest,
  context: { params: Promise<{ projectId: string }> }
) {
  const { projectId } = await context.params; // ✅ MUST AWAIT
  // ... rest of handler
}
```

See [app/api/projects/[projectId]/modules/route.ts](app/api/projects/[projectId]/modules/route.ts) for reference.

### 3. AI Integration

**AI Features**:

- Test case generation (3 new cases from existing ones).
- Test case improvement (clarity/correctness).
- Module analysis (coverage gaps, duplicates, risk areas).

**Usage limits** (per user, per day):

- `generate`: 10 requests/day.
- `improve`: 20 requests/day.
- `analyze`: 5 requests/day.

**AI workflow** (see [lib/ai/actions/testcase.ts](lib/ai/actions/testcase.ts)):

1. Check limits with `checkAndRecordAIUsage(userId, action)` in [lib/ai/usage.ts](lib/ai/usage.ts).
2. Fetch related data from Prisma.
3. Build prompt using functions in [lib/ai/prompts/](lib/ai/prompts/).
4. Call OpenAI via [lib/ai/client.ts](lib/ai/client.ts) with `gpt-3.5-turbo` at temperature 0.3.
5. Parse JSON response (all prompts expect JSON-only responses).

**AI prompts return structured JSON** — never free text:

- `reviewTestCasePrompt()` → `{ issues, missing_scenarios, suggested_improvements }`.
- `generateTestCasesPrompt()` → `{ generated_test_cases: [{ title, steps[], expected }] }`.
- `analyzeModulePrompt()` → `{ duplicate_test_cases, missing_coverage, risk_areas, overall_quality }`.

### 4. Prisma Usage

**Always use the shared Prisma client**:

```typescript
import prisma from "@/lib/prisma";
```

**Common patterns**:

- Cascade deletes are configured in schema — no manual cleanup needed.
- Use `include` for eager loading relations, not separate queries.
- Test cases store `steps` as JSON array (not string).
- Tags are stored as `String[]` array.

### 5. Test Case Structure

TestCase model fields:

- `steps`: JSON array of step strings (not stringified JSON).
- `expected`: Single expected result string.
- `type`: `MANUAL` or `AUTOMATION` (default: MANUAL).
- `tags`: String array for categorization.
- `automationRef`: Optional 1:1 relation with repo URL, file path, test name.

## Development Workflow

**Run development server**:

```bash
npm run dev
```

**Database operations**:

```bash
npx prisma studio          # View/edit data in browser.
npx prisma migrate dev     # Create and apply migrations.
npx prisma generate        # Regenerate Prisma Client.
```

**Environment variables required**:

- `DATABASE_URL` — PostgreSQL connection string.
- `GOOGLE_CLIENT_ID` / `GOOGLE_CLIENT_SECRET` — OAuth credentials.
- `OPENAI_API_KEY` — For AI features.
- `NEXTAUTH_SECRET` — Auth token signing key.
- `NEXTAUTH_URL` — Application base URL.

## Key Files Reference

- **Auth setup**: [app/api/auth/[...nextauth]/route.ts](app/api/auth/[...nextauth]/route.ts).
- **Schema**: [prisma/schema.prisma](prisma/schema.prisma).
- **AI client**: [lib/ai/client.ts](lib/ai/client.ts).
- **Project access control**: [lib/project-access.ts](lib/project-access.ts).
- **Product requirements**: [docs/PRODUCT_OVERVIEW.md](docs/PRODUCT_OVERVIEW.md), [docs/MVP_SCOPE.md](docs/MVP_SCOPE.md).

## Conventions

- **No nested folders** beyond Module level — flat structure for test cases.
- **Human-in-the-loop AI** — all AI suggestions require user review/approval.
- **MVP scope** — avoid enterprise features (RBAC, custom workflows, CI/CD integration).
- **Route handlers** must export runtime: `export const runtime = "nodejs";`.
- **Error messages** should be user-friendly, not stack traces.