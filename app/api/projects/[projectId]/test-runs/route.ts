export const runtime = "nodejs";

import { NextResponse } from "next/server";
import { getAuthSession } from "@/lib/auth";

import prisma from "@/lib/prisma";
import { getProjectMemberRole } from "@/lib/project-access";
import { canManageProject } from "@/lib/permissions";

export async function POST(
  req: Request,
  { params }: { params: Promise<{ projectId: string }> }
) {
  const { projectId } = await params;

  const session = await getAuthSession();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { name } = await req.json();
  if (!name) {
    return NextResponse.json(
      { error: "Test run name required" },
      { status: 400 }
    );
  }
  const role = await getProjectMemberRole(projectId, session.user.id);

if (!role) {
  return NextResponse.json({ error: "Forbidden" }, { status: 403 });
}

if (role !== "OWNER") {
  return NextResponse.json({ error: "Only owner allowed" }, { status: 403 });
}

if (!canManageProject(role)) {
  return NextResponse.json(
    { error: "Forbidden" },
    { status: 403 }
  );
}

  // Fetch all test cases for the project
  const testCases = await prisma.testCase.findMany({
    where: { projectId },
    select: { id: true },
  });

  // Create test run
  const testRun = await prisma.testRun.create({
    data: {
      name,
      projectId,
      userId: session.user.id,
      results: {
        create: testCases.map(tc => ({
          testCaseId: tc.id,
          status: "BLOCKED", // default
        })),
      },
    },
  });

  return NextResponse.json({ success: true, data: testRun });
}


export async function GET(
  req: Request,
  { params }: { params: Promise<{ projectId: string }> }
) {
  const { projectId } = await params;

  const session = await getAuthSession();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const runs = await prisma.testRun.findMany({
    where: { projectId },
    orderBy: { startedAt: "desc" },
    select: {
      id: true,
      name: true,
      startedAt: true,
      endedAt: true,
      status: true, // Include the status field
    },
  });

  return NextResponse.json({ success: true, data: runs });
}

