import { NextResponse } from "next/server";
import { getAuthSession } from "@/lib/auth";
import { analyzeModule } from "@/lib/ai/actions/module";
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
    await checkAndRecordAIUsage(session.user.id, "improve");
    const result = await analyzeModule(moduleId);
    return NextResponse.json({ success: true, data: result });
  } catch (error: any) {
    console.error("Module AI analysis failed:", error);
    return NextResponse.json(
      { error: error.message ?? "AI analysis failed" },
      { status: 500 }
    );
  }
}
