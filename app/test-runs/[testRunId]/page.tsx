/*
  TestRun Page (Server)
  ---------------------
  Server component that loads a `TestRun` and prepares data for the
  `TestRunExecutionClient` client component. Responsibilities:
  - Authenticate the user and enforce access control
  - Load `TestRun` with related `results` and `testCase` data
  - Normalize `testCase.steps` (JSON) into `string[]` for the client
  - Group results by module and compute the execution summary

  Notes:
  - This is a server component; it must `await` route `params` (App Router)
  - No mutations are performed here; it only prepares data for the client
*/
import { getAuthSession } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { getProjectMemberRole } from "@/lib/project-access";
import { redirect } from "next/navigation";
import { calculateTestRunSummary } from "@/lib/test-runs/summary";
import TestRunExecutionClient from "./TestRunExecutionClient";

export default async function TestRunPage({
  params,
}: {
  params: Promise<{ testRunId: string }>;
}) {
  // ✅ MUST await params
  const { testRunId } = await params;

  const session = await getAuthSession();
  if (!session?.user?.id) {
    redirect("/api/auth/signin");
  }

  const testRun = await prisma.testRun.findUnique({
    where: { id: testRunId },
    select: {
      id: true,
      name: true,
      project: { select: { id: true, name: true } },
      // `setup` is a scalar (JSON) field — use `select` not `include`
      setup: true,
      assignedToId: true,
      userId: true,
      status: true,
      startedAt: true,
      endedAt: true,
      // results is a relation — include related testCase data
      results: {
        include: {
          testCase: {
            select: {
              module: { select: { id: true, name: true } },
              id: true,
              title: true,
              steps: true,
              expected: true,
            },
          },
        },
      },
    },
  });

  if (!testRun) {
    return <p style={{ padding: 24 }}>Test run not found</p>;
  }
  if(testRun.assignedToId !== session.user.id && testRun.userId !== session.user.id)
  {
    redirect("/dashboard");
  }

  
  // Normalize `testCase.steps` which comes from a JSON column (JsonValue)
  // into a `string[]` that the client expects.
  const normalizeSteps = (raw: any): string[] => {
    if (Array.isArray(raw)) return raw.map(String);
    if (raw == null) return [];
    try {
      const parsed = typeof raw === "string" ? JSON.parse(raw) : raw;
      return Array.isArray(parsed) ? parsed.map(String) : [];
    } catch {
      return [];
    }
  };

  const normalizedResults = testRun.results.map((r) => ({
    ...r,
    testCase: {
      ...r.testCase,
      steps: normalizeSteps((r.testCase as any).steps),
    },
  }));

  const summary = calculateTestRunSummary(normalizedResults);

  const modulesMap = new Map<string, any>();
  for (const result of normalizedResults) {
    const module = result.testCase.module;
    const moduleId = module?.id ?? "unassigned";

    if (!modulesMap.has(moduleId)) {
      modulesMap.set(moduleId, {
        id: moduleId,
        name: module?.name ?? "Unassigned",
        results: [],
      });
    }

    modulesMap.get(moduleId).results.push(result);
  }

  // Determine current user's project role to enable owner-only actions
  const role = await getProjectMemberRole(testRun.project.id, session.user.id);
  const canEdit = role === "OWNER";

  return (
    <TestRunExecutionClient
      testRun={{
        id: testRun.id,
        name: testRun.name,
        projectName: testRun.project.name,
        status: testRun.status,
        assignedToId: testRun.assignedToId,
        startedAt: testRun.startedAt.toISOString(),
        endedAt: testRun.endedAt ? testRun.endedAt.toISOString() : "",
        results: normalizedResults,
        summary,
        modules: Array.from(modulesMap.values()),
        // forward setup (may be null) so the client can show Execution Setup
        setup: testRun.setup ?? null,
      }}
      canEdit={canEdit}
    />
  );
}
