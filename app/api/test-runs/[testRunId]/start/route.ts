/*
  API: Start Test Run
  -------------------
  Transitions a TestRun into `IN_PROGRESS` and unlocks results for editing.
  Only the assigned contributor is allowed to start a run. This header is
  documentation-only; implementation follows.
*/
import { NextResponse } from "next/server";
import { getAuthSession } from "@/lib/auth";
import prisma from "@/lib/prisma";

export async function POST(
  req: Request,
  context: { params: Promise<{ testRunId: string }> }
) {
  const { testRunId } = await context.params;

  const session = await getAuthSession();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const testRun = await prisma.testRun.findUnique({
    where: { id: testRunId },
  });

  if (!testRun) {
    // No run found with given id
    return NextResponse.json({ error: "Test run not found" }, { status: 404 });
  }

  // Authorization: only the assigned contributor may start execution
  if (testRun.assignedToId !== session.user.id) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  if (testRun.status !== "STARTED") {
    return NextResponse.json(
      { error: "Test run already started or completed" },
      { status: 400 }
    );
  }
  if (!testRun.setup) {
  return NextResponse.json(
    { error: "Setup is required before starting execution" },
    { status: 400 }
  );
}

  // Update run to IN_PROGRESS and unlock results for editing
  await prisma.testRun.update({
    where: { id: testRunId },
    data: {
      status: "IN_PROGRESS",
      startedAt: new Date(),
      isLocked: false,
    },
  });

  return NextResponse.json({ success: true });
}
