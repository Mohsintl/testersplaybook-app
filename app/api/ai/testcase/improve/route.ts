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

  const { testCaseId } = await req.json();
  if (!testCaseId) {
    return NextResponse.json({ error: "testCaseId required" }, { status: 400 });
  }

  await checkAndRecordAIUsage(session.user.id, "improve");

  /**
   * Fetch test case + module + project
   */
  const testCase = await prisma.testCase.findUnique({
    where: { id: testCaseId },
    include: {
      module: {
        include: {
          project: true,
        },
      },
    },
  });

  if (!testCase || !testCase.module) {
    return NextResponse.json({ error: "Test case not found" }, { status: 404 });
  }

  /**
   * Fetch behaviors
   */
  const [projectBehaviors, moduleBehaviors] = await Promise.all([
    prisma.projectBehavior.findMany({
      where: {
        projectId: testCase.module.projectId,
        scope: "PROJECT",
      },
      select: { userAction: true, systemResult: true },
    }),
    prisma.projectBehavior.findMany({
      where: {
        moduleId: testCase.moduleId!,
        scope: "MODULE",
      },
      select: { userAction: true, systemResult: true },
    }),
  ]);

  /**
   * Prompt
   */
  const prompt = `
You are a senior QA engineer reviewing and improving a test case.

====================
PROJECT CONTEXT
====================
Project: ${testCase.module.project.name}
Description:
${testCase.module.project.description ?? "No description provided"}

Project behaviors:
${projectBehaviors.length === 0
  ? "- None provided"
  : projectBehaviors
      .map(b => `- When user ${b.userAction}, system ${b.systemResult}`)
      .join("\n")
}

====================
MODULE CONTEXT
====================
Module: ${testCase.module.name}
Description:
${testCase.module.description ?? "No description provided"}

Module behaviors:
${moduleBehaviors.length === 0
  ? "- None provided"
  : moduleBehaviors
      .map(b => `- When user ${b.userAction}, system ${b.systemResult}`)
      .join("\n")
}

====================
CURRENT TEST CASE
====================
Title: ${testCase.title}
Steps: ${JSON.stringify(testCase.steps)}
Expected: ${testCase.expected}

====================
INSTRUCTIONS
====================
Improve the test case by:
- Making steps precise and unambiguous
- Aligning steps with actual behaviors
- Improving expected result clarity
- NOT changing the intent
- NOT adding unrelated flows

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

  const content = completion.choices[0].message.content ?? "";
  const clean = content.replace(/```json|```/g, "").trim();

  return NextResponse.json({
    success: true,
    data: JSON.parse(clean),
  });
}
