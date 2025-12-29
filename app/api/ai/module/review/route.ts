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

  // 🔒 Rate limit (analyze)
  await checkAndRecordAIUsage(session.user.id, "analyze");

  // ✅ Fetch module WITH project context
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
          id: true,
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

  // 🧠 Structured prompt (important)
  const prompt = `
You are a senior QA engineer reviewing test coverage quality.

PROJECT CONTEXT
Name: ${module.project.name}
Description: ${module.project.description ?? "Not provided"}

MODULE CONTEXT
Name: ${module.name}
Description: ${module.description ?? "Not provided"}

TEST CASES
${JSON.stringify(module.testCases, null, 2)}

Analyze the module test coverage and return ONLY valid JSON.

{
  "duplicate_test_cases": [
    {
      "test_case_ids": string[],
      "reason": string
    }
  ],
  "missing_coverage": string[],
  "risk_areas": string[],
  "overall_quality": "LOW" | "MEDIUM" | "HIGH"
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

  try {
    const data = JSON.parse(content);

    return NextResponse.json({
      success: true,
      data,
    });
  } catch (error) {
    return NextResponse.json(
      { error: "Invalid JSON response from AI", details: (error instanceof Error ? error.message : "Unknown error") },
      { status: 500 }
    );
  }
}
