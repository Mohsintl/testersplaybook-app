import { NextResponse } from "next/server";
import { getAuthSession } from "@/lib/auth";
import prisma from "@/lib/prisma";

export async function POST(
  req: Request,
  { params }: { params: Promise<{ moduleId: string }> }
) {
  // ✅ unwrap params (Next.js App Router requirement)
  const { moduleId } = await params;

  if (!moduleId) {
    return NextResponse.json(
      { error: "moduleId required" },
      { status: 400 }
    );
  }

  // ✅ auth check
  const session = await getAuthSession();
  if (!session?.user?.id) {
    return NextResponse.json(
      { error: "Unauthorized" },
      { status: 401 }
    );
  }

  // ✅ body validation
  const { testCases } = await req.json();

  if (!Array.isArray(testCases) || testCases.length === 0) {
    return NextResponse.json(
      { error: "testCases array required" },
      { status: 400 }
    );
  }

  // ✅ get module + projectId
  const module = await prisma.module.findUnique({
    where: { id: moduleId },
    select: {
      id: true,
      projectId: true,
    },
  });

  if (!module) {
    return NextResponse.json(
      { error: "Module not found" },
      { status: 404 }
    );
  }

  // ✅ normalize + validate AI-generated data
  const data = testCases.map((tc: any) => {
    if (!tc.title || !tc.steps || !tc.expected) {
      throw new Error("Invalid test case structure");
    }

    return {
      title: tc.title,
      steps: tc.steps,
      expected: tc.expected,
      moduleId: module.id,
      projectId: module.projectId,
      type: "MANUAL",
    };
  });

  try {
    // ✅ bulk insert (fast & safe)
    await prisma.testCase.createMany({
      data,
    });

    return NextResponse.json({
      success: true,
      created: data.length,
    });
  } catch (error) {
    console.error("Bulk create test cases failed:", error);

    return NextResponse.json(
      { error: "Failed to create test cases" },
      { status: 500 }
    );
  }
}
