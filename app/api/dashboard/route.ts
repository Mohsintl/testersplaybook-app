import { NextResponse } from "next/server";
import { getAuthSession } from "@/lib/auth";
import prisma from "@/lib/prisma";

export const runtime = "nodejs";

export async function GET() {
  const session = await getAuthSession();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const userId = session.user.id;

  const assignedRuns = await prisma.testRun.findMany({
    where: {
      assignedToId: userId,
    },
    include: {
      project: {
        select: { id: true, name: true },
      },
    },
    orderBy: {
      startedAt: "desc",
    },
  });

  return NextResponse.json({
    success: true,
    data: assignedRuns,
  });
}
