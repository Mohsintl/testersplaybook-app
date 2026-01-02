import { NextResponse } from "next/server";
import { getAuthSession } from "@/lib/auth";
import prisma from "@/lib/prisma";

export async function GET() {
  const session = await getAuthSession();
  if (!session?.user?.id) {
    return NextResponse.json({ assigned: false }, { status: 401 });
  }

  const count = await prisma.testRun.count({
    where: {
      assignedToId: session.user.id,
      endedAt: null, // only active runs
    },
  });

  return NextResponse.json({
    assigned: count > 0,
  });
}
