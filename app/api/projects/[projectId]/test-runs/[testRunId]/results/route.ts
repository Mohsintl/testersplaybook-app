/*
  API: TestRun Results
  --------------------
  Returns the TestRun's results and all project TestCases to assist the
  execution UI. Authenticated users may call this endpoint; additional
  checks are performed as needed in the implementation.
*/
import { NextResponse } from "next/server";
import { getAuthSession } from "@/lib/auth";
import prisma from "@/lib/prisma";

export async function GET(
  req: Request,
  context: { params: Promise<{ testRunId: string }> }
) {
  const session = await getAuthSession();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { testRunId } = await context.params;

  const testRun = await prisma.testRun.findUnique({
    where: { id: testRunId },
    include: {
      project: true,
      results: true,
    },
  });

  if (!testRun) {
    return NextResponse.json({ error: "Test run not found" }, { status: 404 });
  }

  const testCases = await prisma.testCase.findMany({
    where: { projectId: testRun.projectId },
    select: {
      id: true,
      title: true,
      steps: true,
      expected: true,
    },
  });

  return NextResponse.json({
    success: true,
    data: {
      testRun: {
        id: testRun.id,
        name: testRun.name,
      },
      testCases,
      results: testRun.results,
    },
  });
}
