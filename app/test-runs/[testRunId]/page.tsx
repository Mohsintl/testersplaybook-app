import prisma from "@/lib/prisma";
import { getAuthSession } from "@/lib/auth";
import { redirect } from "next/navigation";
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

  return (
    <TestRunExecutionClient
      testRun={{
        id: testRun.id,
        name: testRun.name,
        projectName: testRun.project.name,
        results: testRun.results ,
      }}
    />
  );
}
