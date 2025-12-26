import { NextResponse } from "next/server";
import { getAuthSession } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { checkAndRecordAIUsage } from "@/lib/ai/usage";
import openai from "@/lib/ai/client";

export async function POST(req: Request) {
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

  const module = await prisma.module.findUnique({
    where: { id: moduleId },
    include: {
    
      testCases: {
        select: {
          id: true,
          title: true,
          steps: true,
          expected: true,
        },
      },
    },
  });

  if (!module) {
    return NextResponse.json({ error: "Module not found" }, { status: 404 });
  }

  if (module.testCases.length === 0) {
    return NextResponse.json({
      success: true,
      data: {
        overall_quality: "LOW",
        duplicate_test_cases: [],
        missing_coverage: ["No test cases found"],
        risk_areas: ["Module has no test coverage"],
      },
    });
  }

  const prompt = `
You are a senior QA engineer.

Review the following MODULE and its test cases.

Module name:
${module.name}

Module description:
${module.description ?? "No description provided"}

Test cases:
${JSON.stringify(module.testCases, null, 2)}

Analyze:
1. Duplicate test scenarios
2. Missing functional coverage
3. Risk areas
4. Overall quality (LOW | MEDIUM | HIGH)

Return ONLY valid JSON in this format:
{
  "duplicate_test_cases": [
    {
      "test_case_ids": ["string"],
      "reason": "string"
    }
  ],
  "missing_coverage": ["string"],
  "risk_areas": ["string"],
  "overall_quality": "LOW | MEDIUM | HIGH"
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
