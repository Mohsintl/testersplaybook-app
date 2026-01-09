/*
  API: Update TestResult
  ----------------------
  PATCH endpoint to update a TestResult's `status` and `notes`.
  Guards ensure only authorized users may update results and only when the
  parent TestRun is IN_PROGRESS.
*/
export const runtime = "nodejs";

import { NextResponse } from "next/server";
import { getAuthSession } from "@/lib/auth";
import prisma from "@/lib/prisma";

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ testResultId: string }> }
) {
  const session = await getAuthSession();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { testResultId } = await params;
  const { status, notes } = await req.json();

  if (!status) {
    // Incoming request must include a new `status` value
    return NextResponse.json(
      { error: "Status required" },
      { status: 400 }
    );
  }
    const result = await prisma.testResult.findUnique({
    where: { id: testResultId },
    include: { testRun: true },
  });

  if (!result) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
if (
  result.testRun.assignedToId !== session.user.id &&
  result.testRun.userId !== session.user.id
) {
  return NextResponse.json(
    { error: "Forbidden" },
    { status: 403 }
  );
}
  // Guard: ensure execution has started (and not already completed)
  if (result.testRun.status !== "IN_PROGRESS") {
    return NextResponse.json(
      { error: "Execution not started" },
      { status: 400 }
    );
  }

  if (result.testRun.status === "COMPLETED") {
    return NextResponse.json(
      { error: "Test run is locked" },
      { status: 403 }
    );
  }
  

  await prisma.testResult.update({
    where: { id: testResultId },
    data: { status, notes },
  });

  const updated = await prisma.testResult.update({
    where: { id: testResultId },
    data: {
      status,
      notes: notes ?? null,
    },
  });

  return NextResponse.json({ success: true, data: updated });
}
