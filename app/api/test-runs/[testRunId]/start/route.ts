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
    return NextResponse.json({ error: "Test run not found" }, { status: 404 });
  }

  // 🔒 Only assigned contributor can start
  if (testRun.assignedToId !== session.user.id) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  if (testRun.status !== "STARTED") {
    return NextResponse.json(
      { error: "Test run already started or completed" },
      { status: 400 }
    );
  }

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
