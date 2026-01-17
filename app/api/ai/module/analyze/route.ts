import { NextResponse } from "next/server";
import { getAuthSession } from "@/lib/auth";
import prisma from "@/lib/prisma";
import openai from "@/lib/ai/client";
import { checkAndRecordAIUsage } from "@/lib/ai/usage";

export async function POST(req: Request) {
  const session = await getAuthSession();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { moduleId } = await req.json();
  if (!moduleId) {
    return NextResponse.json({ error: "moduleId required" }, { status: 400 });
  }

  // 🔒 Rate limit
  try {
    await checkAndRecordAIUsage(session.user.id, "analyze");
  } catch (err: any) {
    // If usage limit reached, return structured 429 response
    if (err?.name === "AIUsageError" || err?.code === "AI_USAGE_LIMIT") {
      return NextResponse.json(
        { error: err.message, code: err.code ?? "AI_USAGE_LIMIT", remaining: err.remaining ?? 0 },
        { status: 429 }
      );
    }
    throw err;
  }

  /**
   * Fetch module + project
   */
  const module = await prisma.module.findUnique({
    where: { id: moduleId },
    include: {
      project: true,
    },
  });

  if (!module) {
    return NextResponse.json({ error: "Module not found" }, { status: 404 });
  }

  /**
   * Fetch behaviors
   */
  const [projectBehaviors, moduleBehaviors] = await Promise.all([
    prisma.projectBehavior.findMany({
      where: {
        projectId: module.projectId,
        scope: "PROJECT",
      },
      select: {
        userAction: true,
        systemResult: true,
      },
    }),
    prisma.projectBehavior.findMany({
      where: {
        moduleId,
        scope: "MODULE",
      },
      select: {
        userAction: true,
        systemResult: true,
      },
    }),
  ]);

  /**
   * Fetch test cases WITH FULL DETAILS
   */
  const testCases = await prisma.testCase.findMany({
    where: { moduleId },
    select: {
      id: true,
      title: true,
      steps: true,
      expected: true,
    },
  });

  if (testCases.length === 0) {
    return NextResponse.json({
      success: true,
      data: {
        overall_quality: "LOW",
        risk_areas: ["No test cases exist"],
        missing_coverage: ["Add basic positive and negative scenarios"],
        duplicate_test_cases: [],
        title_issues: [],
      },
    });
  }

  /**
   * Build prompt
   */
  const prompt = `
You are a senior QA engineer.

====================
PROJECT CONTEXT
====================
Project name:
${module.project.name}

Project description:
${module.project.description ?? "No description provided"}

Global behaviors:
${projectBehaviors.length === 0
    ? "- None"
    : projectBehaviors.map(b => `- When user ${b.userAction}, system ${b.systemResult}`).join("\n")
}

====================
MODULE CONTEXT
====================
Module name:
${module.name}

Module description:
${module.description ?? "No description provided"}

Module behaviors:
${moduleBehaviors.length === 0
    ? "- None"
    : moduleBehaviors.map(b => `- When user ${b.userAction}, system ${b.systemResult}`).join("\n")
}

====================
TEST CASES
====================
${JSON.stringify(testCases, null, 2)}

====================
ANALYZE
====================
1. Overall quality (LOW | MEDIUM | HIGH)
2. Risk areas
3. Missing coverage
4. Duplicate test cases (consider title + steps + expected)
5. Title issues (unclear, misleading, vague titles)

Return ONLY valid JSON:
{
  "overall_quality": "LOW" | "MEDIUM" | "HIGH",
  "risk_areas": string[],
  "missing_coverage": string[],
  "duplicate_test_cases": [
    {
      "test_case_ids": string[],
      "reason": string
    }
  ],
  "title_issues": [
    {
      "testCaseId": string,
      "reason": string,
      "suggested_title": string
    }
  ]
}
`;

  const completion = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    messages: [{ role: "user", content: prompt }],
    temperature: 0.2,
  });

  let parsed;
  try {
    parsed = JSON.parse(
      completion.choices[0].message.content!
        .replace(/```json/g, "")
        .replace(/```/g, "")
        .trim()
    );
  } catch {
    return NextResponse.json(
      { error: "AI returned invalid JSON" },
      { status: 500 }
    );
  }

  return NextResponse.json({ success: true, data: parsed });
}
