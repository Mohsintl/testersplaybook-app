import { NextResponse } from "next/server";
import { getAuthSession } from "@/lib/auth";
import prisma from "@/lib/prisma";

/* =========================
   APPLY AI IMPROVEMENTS (POST)
   ========================= */
export async function POST(
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

  const { improved_title, improved_steps, improved_expected } = await req.json();

  if (!improved_title || !improved_steps || !improved_expected) {
    return NextResponse.json(
      { error: "Missing AI improvement fields" },
      { status: 400 }
    );
  }

  try {
    const updated = await prisma.testCase.update({
      where: { id: testCaseId },
      data: {
        title: improved_title,
        steps: improved_steps,
        expected: improved_expected,
      },
    });

    return NextResponse.json({ success: true, data: updated });
  } catch (error) {
    console.error("Apply AI changes failed:", error);
    return NextResponse.json(
      { error: "Failed to apply AI changes" },
      { status: 500 }
    );
  }
}

// /