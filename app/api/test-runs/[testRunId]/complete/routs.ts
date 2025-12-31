import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getAuthSession } from "@/lib/auth";

export const runtime = "nodejs";

export async function POST(
  req: Request,
  context: { params: Promise<{ testRunId: string }> } // ✅ PROMISE
) {
  // 🔐 Auth
  const session = await getAuthSession();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // ✅ MUST await params
  const { testRunId } = await context.params;

  if (!testRunId) {
    return NextResponse.json(
      { error: "testRunId missing" },
      { status: 400 }
    );
  }

  // 🔎 Fetch test run
  const testRun = await prisma.testRun.findUnique({
    where: { id: testRunId },
    select: {
      id: true,
      endedAt: true,
    },
  });

  if (!testRun) {
    return NextResponse.json(
      { error: "Test run not found" },
      { status: 404 }
    );
  }

  // 🔒 Already finished → do nothing
  if (testRun.endedAt) {
    return NextResponse.json({
      success: true,
      endedAt: testRun.endedAt,
    });
  }

  // ✅ Persist lock
  const updated = await prisma.testRun.update({
    where: { id: testRunId },
    data: {
      endedAt: new Date(),
    },
    select: {
      endedAt: true,
    },
  });

  return NextResponse.json({
    success: true,
    endedAt: updated.endedAt,
  });
}
