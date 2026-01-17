// This file defines the API route for generating new test cases using AI.
// It integrates with OpenAI's GPT model to create test cases based on existing data.
// The route ensures proper usage limits and authentication for AI-powered operations.

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

  // 🔒 Rate limit
  try {
    await checkAndRecordAIUsage(session.user.id, "generate");
  } catch (err: any) {
    if (err?.name === "AIUsageError" || err?.code === "AI_USAGE_LIMIT") {
      return NextResponse.json(
        { error: err.message, code: err.code ?? "AI_USAGE_LIMIT", remaining: err.remaining ?? 0 },
        { status: 429 }
      );
    }
    throw err;
  }

  /**
   * 1️⃣ Fetch module + project
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
   * 2️⃣ Fetch behaviors
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
   * 3️⃣ Fetch existing test cases
   */
  const existingTestCases = await prisma.testCase.findMany({
    where: { moduleId },
    select: {
      title: true,
      steps: true,
      expected: true,
    },
  });

  /**
   * 4️⃣ Build prompt (THIS IS THE CORE VALUE)
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

Global application behaviors:
${projectBehaviors.length === 0
    ? "- None provided"
    : projectBehaviors
        .map(b => `- When user ${b.userAction}, system ${b.systemResult}`)
        .join("\n")
}

====================
MODULE CONTEXT
====================
Module name:
${module.name}

Module description:
${module.description ?? "No description provided"}

Module-specific behaviors:
${moduleBehaviors.length === 0
    ? "- None provided"
    : moduleBehaviors
        .map(b => `- When user ${b.userAction}, system ${b.systemResult}`)
        .join("\n")
}

====================
EXISTING TEST CASES (DO NOT DUPLICATE)
====================
${existingTestCases.length === 0
    ? "- No test cases exist yet"
    : JSON.stringify(existingTestCases, null, 2)
}

====================
INSTRUCTIONS
====================
1. Generate 3–5 NEW test cases for THIS MODULE ONLY
2. Use project behaviors as global context
3. Use module behaviors as primary context
4. Do NOT repeat existing test cases
5. Do NOT generate test cases belonging to other modules
6. Focus on missing, high-risk, and edge scenarios

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

  /**
   * 5️⃣ Call OpenAI
   */
  const completion = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    messages: [{ role: "user", content: prompt }],
    temperature: 0.3,
  });

  const raw = completion.choices[0].message.content ?? "";

// 1️⃣ Remove ```json and ``` if present
const cleaned = raw
  .replace(/```json/g, "")
  .replace(/```/g, "")
  .trim();

// 2️⃣ Parse safely
let parsed: any;
try {
  parsed = JSON.parse(cleaned);
} catch (err) {
  console.error("AI returned invalid JSON:", raw);
  return NextResponse.json(
    { error: "AI response parsing failed" },
    { status: 500 }
  );
}


  return NextResponse.json({
    success: true,
    data: parsed.generated_test_cases ?? [],
  });
}
