export const runtime = "nodejs";

import { NextResponse } from "next/server";
import { getAuthSession } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { getProjectMember } from "@/lib/project-access";

/* ---------------- POST: Create Test Case ---------------- */

export async function POST(
  req: Request,
  context: { params: Promise<{ projectId: string }> }
) {
  const { projectId } = await context.params; // ✅ FIX: await params
  const session = await getAuthSession();

  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const role = await getProjectMember(projectId, session.user.id);
  if (!role) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { title, description, steps, expected, tags, moduleId } =
    await req.json();

  if (!title || !steps || !expected) {
    return NextResponse.json(
      { error: "Title, steps, and expected result are required" },
      { status: 400 }
    );
  }

  try {
    const testCase = await prisma.testCase.create({
      data: {
        title,
        description,
        steps,
        expected,
        tags: tags ?? [],
        moduleId: moduleId ?? null,
        projectId,
        type: "MANUAL",
      },
    });

    return NextResponse.json(testCase, { status: 201 });
  } catch (error) {
    console.error("Create test case failed:", error);
    return NextResponse.json(
      { error: "Failed to create test case" },
      { status: 500 }
    );
  }
}

/* ---------------- GET: List Test Cases ---------------- */

export async function GET(
  req: Request,
  context: { params: Promise<{ projectId: string }> }
) {
  const { projectId } = await context.params; // ✅ FIX: await params
  const session = await getAuthSession();

  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const role = await getProjectMember(projectId, session.user.id);
  if (!role) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  try {
    const testCases = await prisma.testCase.findMany({
      where: { projectId },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(testCases);
  } catch (error) {
    console.error("Fetch test cases failed:", error);
    return NextResponse.json(
      { error: "Failed to fetch test cases" },
      { status: 500 }
    );
  }
}
