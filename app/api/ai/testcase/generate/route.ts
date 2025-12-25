import { NextResponse } from "next/server";
import { getAuthSession } from "@/lib/auth";
import { generateTestCases } from "@/lib/ai/actions/testcase";
import { checkAndRecordAIUsage } from "@/lib/ai/usage";


export async function POST(req: Request) {
  const session = await getAuthSession();

  if (!session?.user?.id) {
    return NextResponse.json(
      { error: "Unauthorized" },
      { status: 401 }
    );
  }

  const { moduleId } = await req.json();

  if (!moduleId) {
    return NextResponse.json(
      { error: "moduleId is required" },
      { status: 400 }
    );
  }

  try {
    await checkAndRecordAIUsage(session.user.id, "generate");
    const result = await generateTestCases(moduleId);
    return NextResponse.json({ success: true, data: result });
  } catch (error: any) {
    console.error("AI generate testcases failed:", error);
    return NextResponse.json(
      { error: error.message ?? "AI request failed" },
      { status: 500 }
    );
  }
}
