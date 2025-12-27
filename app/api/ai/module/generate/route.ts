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
    return NextResponse.json(
      { error: "moduleId required" },
      { status: 400 }
    );
  }

  // 🔒 Rate limit
  await checkAndRecordAIUsage(session.user.id, "generate");

  const module = await prisma.module.findUnique({
    where: { id: moduleId },
    include: {
      project: {
        select: {
          name: true,
          description: true,
        },
      },
      testCases: {
        select: {
          title: true,
          steps: true,
          expected: true,
        },
      },
    },
  });

  if (!module) {
    return NextResponse.json(
      { error: "Module not found" },
      { status: 404 }
    );
  }

  const hasExistingTests = module.testCases.length > 0;

  const prompt = hasExistingTests
    ? `
You are a senior QA engineer.

PROJECT CONTEXT
Name: ${module.project.name}
Description: ${module.project.description ?? "Not provided"}

MODULE CONTEXT
Name: ${module.name}
Description: ${module.description ?? "Not provided"}

EXISTING TEST CASES (DO NOT DUPLICATE):
${JSON.stringify(module.testCases, null, 2)}

TASK:
Generate NEW test cases that improve coverage.

RULES:
- Do NOT repeat or rephrase existing scenarios
- Focus on missing edge cases, negative paths, validations, and risks
- Only generate NET-NEW scenarios

Generate 3–5 test cases.

Return ONLY valid JSON:
{
  "generated_test_cases": [
    {
      "title": string,
      "steps": string[],
      "expected": string
    }
  ]
}
`
    : `
You are a senior QA engineer.

PROJECT CONTEXT
Name: ${module.project.name}
Description: ${module.project.description ?? "Not provided"}

MODULE CONTEXT
Name: ${module.name}
Description: ${module.description ?? "Not provided"}

TASK:
This module currently has NO test cases.

Generate an initial, well-rounded test suite that includes:
- Happy path
- Negative scenarios
- Input validation
- Edge cases
- Risk-prone areas

Generate 4–6 test cases that would be expected
from a professional QA engineer starting fresh.

Return ONLY valid JSON:
{
  "generated_test_cases": [
    {
      "title": string,
      "steps": string[],
      "expected": string
    }
  ]
}
`;

  const completion = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    messages: [{ role: "user", content: prompt }],
    temperature: 0.3,
  });

  const content = completion.choices[0].message.content;

  if (!content) {
    return NextResponse.json(
      { error: "Empty AI response" },
      { status: 500 }
    );
  }

  const parsed = JSON.parse(content);

  return NextResponse.json({
    success: true,
    data: parsed.generated_test_cases,
  });
}
