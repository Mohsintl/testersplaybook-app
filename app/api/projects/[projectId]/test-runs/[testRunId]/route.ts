export const runtime = "nodejs";

import { NextResponse } from "next/server";
import { getAuthSession } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { getProjectMemberRole } from "@/lib/project-access";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ projectId: string; testRunId: string }> }
) {
  const { projectId, testRunId } = await params;

  const session = await getAuthSession();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const role = await getProjectMemberRole(projectId, session.user.id);

if (!role) {
  return NextResponse.json({ error: "Forbidden" }, { status: 403 });
}

if (role !== "OWNER") {
  return NextResponse.json({ error: "Only owner allowed" }, { status: 403 });
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

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ projectId: string; testRunId: string }> }
) {
  const { projectId, testRunId } = await params;

  const session = await getAuthSession();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const role = await getProjectMemberRole(projectId, session.user.id);

if (!role) {
  return NextResponse.json({ error: "Forbidden" }, { status: 403 });
}

if (role !== "OWNER") {
  return NextResponse.json({ error: "Only owner allowed" }, { status: 403 });
}


  const testRun = await prisma.testRun.findUnique({
    where: { id: testRunId },
  });

  if (!testRun) {
    return NextResponse.json({ error: "Test run not found" }, { status: 404 });
  }

  await prisma.testRun.delete({
    where: { id: testRunId },
  });

  return NextResponse.json({ success: true });
}
