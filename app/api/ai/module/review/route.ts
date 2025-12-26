import { NextResponse } from "next/server";
import { getAuthSession } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { checkAndRecordAIUsage } from "@/lib/ai/usage";
import  openai  from "@/lib/ai/client";

export async function POST(req: Request) {
 ;

  const session = await getAuthSession();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { moduleId } = await req.json();
  if (!moduleId) {
    return NextResponse.json({ error: "moduleId required" }, { status: 400 });
  }

  // Rate limit
  await checkAndRecordAIUsage(session.user.id, "analyze");

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
        duplicate_test_cases: [],
        missing_coverage: ["No test cases found"],
        risk_areas: ["Module has no test coverage"],
        recommendations: ["Add basic positive and negative test cases"]
      }
    });
  }

  const prompt = `
You are a senior QA engineer.

Analyze the following test cases for a single module.

Identify:
- Overall quality
- Duplicate or overlapping test cases
- Missing coverage areas
- Risk areas
- Actionable recommendations

Test cases:
${JSON.stringify(testCases)}

Return ONLY valid JSON in this format:
{
  "overall_quality": "LOW | MEDIUM | HIGH",
  "duplicate_test_cases": [
    {
      "test_case_ids": string[],
      "reason": string
    }
  ],
  "missing_coverage": string[],
  "risk_areas": string[],
  "recommendations": string[]
}
`;

  const completion = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    messages: [{ role: "user", content: prompt }],
    temperature: 0.2,
  });

  const content = completion.choices[0].message.content;
  const data = JSON.parse(content!);

  return NextResponse.json({ success: true, data });
}
