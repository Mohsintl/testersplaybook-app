import { NextResponse } from "next/server";
import { getAuthSession } from "@/lib/auth";
import prisma from "@/lib/prisma";

export async function POST(
  req: Request,
  { params }: { params: { testCaseId: string } }
) {
  const session = await getAuthSession();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { testCaseId } = await params;
  if (!testCaseId) {
    return NextResponse.json(
      { error: "Test case ID required" },
      { status: 400 }
    );
  }

  const body = await req.json();
  const { title, steps, expected } = body;

  if (!title || !steps || !expected) {
    return NextResponse.json(
      { error: "Invalid AI data" },
      { status: 400 }
    );
  }

  const testCase = await prisma.testCase.findUnique({
    where: { id: testCaseId },
  });

  if (!testCase) {
    return NextResponse.json(
      { error: "Test case not found" },
      { status: 404 }
    );
  }

  await prisma.testCase.update({
    where: { id: testCaseId },
    data: {
      title,
      steps,
      expected,
    },
  });

  return NextResponse.json({ success: true });
}
