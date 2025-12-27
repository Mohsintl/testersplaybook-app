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

  const { testCaseId, title, steps, expected } = await req.json();

  if (!testCaseId || !title || !steps || !expected) {
    return NextResponse.json(
      { error: "testCaseId, title, steps, expected are required" },
      { status: 400 }
    );
  }

  // 🔒 Rate limit
  await checkAndRecordAIUsage(session.user.id, "improve");

  const testCase = await prisma.testCase.findUnique({
    where: { id: testCaseId },
    include: {
      module: {
        select: {
          name: true,
          description: true,
          project: {
            select: {
              name: true,
              description: true,
            },
          },
        },
      },
    },
  });

  if (!testCase || !testCase.module) {
    return NextResponse.json(
      { error: "Test case context not found" },
      { status: 404 }
    );
  }

  const prompt = `
You are a senior QA engineer.

PROJECT CONTEXT
Name: ${testCase.module.project.name}
Description: ${testCase.module.project.description ?? "Not provided"}

MODULE CONTEXT
Name: ${testCase.module.name}
Description: ${testCase.module.description ?? "Not provided"}

TEST CASE TO IMPROVE
Title: ${title}
Steps: ${JSON.stringify(steps, null, 2)}
Expected: ${expected}

TASK:
Improve this test case while preserving its intent.

RULES:
- Do NOT change the scenario meaning
- Improve clarity, precision, and structure
- Align wording with project & module context
- Avoid adding unnecessary steps

Return ONLY valid JSON:
{
  "improved_title": string,
  "improved_steps": string[],
  "improved_expected": string
}
`;

  const completion = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    messages: [{ role: "user", content: prompt }],
    temperature: 0.2,
  });

  const content = completion.choices[0].message.content;

  if (!content) {
    return NextResponse.json(
      { error: "Empty AI response" },
      { status: 500 }
    );
  }

  const data = JSON.parse(content);

  return NextResponse.json({ success: true, data });
}
