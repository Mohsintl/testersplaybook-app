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
  await checkAndRecordAIUsage(session.user.id, "generate");

  const module = await prisma.module.findUnique({
    where: { id: moduleId },
    include: {
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
    return NextResponse.json({ error: "Module not found" }, { status: 404 });
  }

  const prompt = `
You are a senior QA engineer.

Module name:
${module.name}

Module description:
${module.description ?? "No description provided"}

Existing test cases:
${JSON.stringify(module.testCases, null, 2)}

Generate 3–5 NEW test cases that:
- Cover missing edge cases
- Do NOT repeat existing scenarios
- Are written clearly

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
  const data = JSON.parse(content!);

  return NextResponse.json({ success: true, data });
}
