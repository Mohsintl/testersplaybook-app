import { getAuthSession } from "@/lib/auth";
import prisma from "@/lib/prisma";
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
    include: {
      project: {
        select: {
          name: true,
        },
      },
      results: {
        include: {
          testCase: {
            select: {
              module: {
                select: {
                  id:true,name: true,
                },
              },
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

  const summary = calculateTestRunSummary(testRun.results);

  const modulesMap = new Map<string, any>();

for (const result of testRun.results) {
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

  return (
    <TestRunExecutionClient
      testRun={{
        id: testRun.id,
        name: testRun.name,
        projectName: testRun.project.name,
        startedAt: testRun.startedAt.toISOString(),
        endedAt: testRun.endedAt ? testRun.endedAt.toISOString() : "",
        results: testRun.results,
        summary,
        modules: Array.from(modulesMap.values()),
      }}
    />
  );
}
