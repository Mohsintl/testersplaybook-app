/*
  API: Assign Test Run
  --------------------
  Assigns a TestRun to a user. Enforces authentication and project
  membership checks. Implementation below performs the mutation.
*/
export const runtime = "nodejs";

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

  const { userId } = await req.json();
  if (!userId) {
    return NextResponse.json(
      { error: "userId required" },
      { status: 400 }
    );
  }
  

  const testRun = await prisma.testRun.findUnique({
    where: { id: testRunId },
    include: { project: true },
  });

  if (!testRun) {
    return NextResponse.json(
      { error: "Test run not found" },
      { status: 404 }
    );
  }

  // Only OWNER can assign
  const member = await prisma.projectMember.findUnique({
    where: {
      userId_projectId: {
        userId: session.user.id,
        projectId: testRun.projectId,
      },
    },
  });

  if (!member || member.role !== "OWNER") {
    return NextResponse.json(
      { error: "Only owner can assign test runs" },
      { status: 403 }
    );
  }

  // Ensure assignee is contributor of project
  const assignee = await prisma.projectMember.findUnique({
    where: {
      userId_projectId: {
        userId,
        projectId: testRun.projectId,
      },
    },
  });

  if (!assignee) {
    return NextResponse.json(
      { error: "User is not part of this project" },
      { status: 400 }
    );
  }

  await prisma.testRun.update({
    where: { id: testRunId },
    data: {
      assignedToId: testRun.assignedToId === userId ? null : userId,
    },
  });

  return NextResponse.json({ success: true });
}
