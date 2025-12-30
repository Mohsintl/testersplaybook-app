export const runtime = "nodejs";

import { NextResponse } from "next/server";
import { getAuthSession } from "@/lib/auth";
import prisma from "@/lib/prisma";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ testRunId: string }> }
) {
  const { testRunId } = await params;

  const session = await getAuthSession();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const testRun = await prisma.testRun.findUnique({
    where: { id: testRunId },
    include: {
      results: {
        include: {
          testCase: {
            select: {
              id: true,
              title: true,
              steps: true,
              expected: true,
              module: {
                select: { name: true },
              },
            },
          },
        },
      },
    },
  });

  if (!testRun) {
    return NextResponse.json({ error: "Test run not found" }, { status: 404 });
  }

  return NextResponse.json({
    success: true,
    data: testRun,
  });
}
