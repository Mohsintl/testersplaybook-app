// This file defines the API route for managing individual test cases.
// It handles operations such as retrieving, updating, and deleting test cases by their ID.
// The route ensures proper authentication and authorization for test case-related actions.

import { NextResponse } from "next/server";
import { getAuthSession } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { getProjectMemberRole } from "@/lib/project-access";

/* =========================
   UPDATE TEST CASE
   ========================= */
export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ testCaseId: string }> }
) {
  const { testCaseId } = await params;

  const session = await getAuthSession();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (!testCaseId) {
    return NextResponse.json(
      { error: "Test case ID required" },
      { status: 400 }
    );
  }

  const existing = await prisma.testCase.findUnique({
    where: { id: testCaseId },
    select: { id: true, projectId: true },
  });

  if (!existing) {
    return NextResponse.json({ error: "Test case not found" }, { status: 404 });
  }

  const role = await getProjectMemberRole(existing.projectId, session.user.id);
  if (role !== "OWNER") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { title, steps, expected } = await req.json();

  if (!title || !steps || !expected) {
    return NextResponse.json(
      { error: "Title, steps, and expected are required" },
      { status: 400 }
    );
  }

  try {
    const updated = await prisma.testCase.update({
      where: { id: testCaseId },
      data: {
        title,
        steps,
        expected,
      },
    });

    return NextResponse.json({ success: true, data: updated });
  } catch (error) {
    console.error("Update test case failed:", error);
    return NextResponse.json(
      { error: "Failed to update test case" },
      { status: 500 }
    );
  }
}

/* =========================
   DELETE TEST CASE
   ========================= */
export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ testCaseId: string }> }
) {
  const { testCaseId } = await params;

  const session = await getAuthSession();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (!testCaseId) {
    return NextResponse.json(
      { error: "Test case ID required" },
      { status: 400 }
    );
  }

  const existing = await prisma.testCase.findUnique({
    where: { id: testCaseId },
    select: { id: true, projectId: true },
  });

  if (!existing) {
    return NextResponse.json({ error: "Test case not found" }, { status: 404 });
  }

  const role = await getProjectMemberRole(existing.projectId, session.user.id);
  if (role !== "OWNER") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  await prisma.testCase.delete({
    where: { id: testCaseId },
  });

  return NextResponse.json({ success: true });
}
