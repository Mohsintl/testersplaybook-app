export const runtime = "nodejs";

import { NextRequest, NextResponse } from "next/server";
import { getAuthSession } from "@/lib/auth";
import prisma from "@/lib/prisma";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ moduleId: string }> }
) {
  const { moduleId } = await params;

  const session = await getAuthSession();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { testCases } = await req.json();

    if (!Array.isArray(testCases) || testCases.length === 0) {
      return NextResponse.json(
        { error: "No test cases provided" },
        { status: 400 }
      );
    }

    const project = await prisma.module.findUnique({
      where: { id: moduleId },
      select: { projectId: true },
    });

    if (!project?.projectId) {
      return NextResponse.json(
        { error: "Module not found or project ID missing" },
        { status: 404 }
      );
    }

    const createdTestCases = await Promise.all(
      testCases.map((tc) =>
        prisma.testCase.create({
          data: {
            title: tc.title,
            steps: tc.steps,
            expected: tc.expected,
            moduleId,
            projectId: project.projectId,
          },
        })
      )
    );

    return NextResponse.json({ success: true, data: createdTestCases });
  } catch (error) {
    console.error("Bulk create test cases failed:", error);
    return NextResponse.json(
      { error: "Failed to create test cases" },
      { status: 500 }
    );
  }
}