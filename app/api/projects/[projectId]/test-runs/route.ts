// API route: Create Test Run for a Project
// ----------------------------------------
// Creates a new TestRun and pre-populates `TestResult` rows for every
// `TestCase` in the project. By default the run is created in a locked
// state (`isLocked = true`) so results cannot be modified until the run
// is explicitly started. Authorization is enforced (project owner only).
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

  // Create test run with UNTESTED default results. Each TestCase becomes a
  // TestResult initialized to UNTESTED. The run is locked at creation time
  // to prevent premature edits; starting the run will unlock it.
  const testRun = await prisma.testRun.create({
    data: {
      name,
      projectId,
      userId: session.user.id,
      status: "STARTED",
      isLocked: true,
      results: {
        create: testCases.map((tc) => ({
          testCaseId: tc.id,
          status: "UNTESTED",
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
      assignedToId: true, // Ensure assigned user is included for client UI
    },
  });

  return NextResponse.json({ success: true, data: runs });
}

