import { NextResponse } from "next/server";
import { getAuthSession } from "@/lib/auth";
import { improveTestCase } from "@/lib/ai/actions/testcase";
import { checkAndRecordAIUsage } from "@/lib/ai/usage";

export async function POST(req: Request) {
  const session = await getAuthSession();

  if (!session?.user?.id) {
    return NextResponse.json(
      { error: "Unauthorized" },
      { status: 401 }
    );
  }

  const { testCaseId } = await req.json();

  if (!testCaseId) {
    return NextResponse.json(
      { error: "testCaseId is required" },
      { status: 400 }
    );
  }
  
  try {   
    await checkAndRecordAIUsage(session.user.id, "improve");
    const result = await improveTestCase(testCaseId);
    return NextResponse.json({ success: true, data: result });
  } catch (error: any) {
    console.error("AI improve failed:", error);
    return NextResponse.json(
      { error: error.message ?? "AI request failed" },
      { status: 500 }
    );
  }
}
