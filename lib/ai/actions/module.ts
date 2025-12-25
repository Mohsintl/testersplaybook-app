import prisma from "@/lib/prisma";
import openai from "@/lib/ai/client";
import { analyzeModulePrompt } from "@/lib/ai/prompts/module";

async function runAI(prompt: string) {
  const response = await openai.chat.completions.create({
    model: "gpt-3.5-turbo",
    messages: [{ role: "user", content: prompt }],
    temperature: 0.3,
  });

  const content = response.choices[0]?.message?.content;
  if (!content) {
    throw new Error("AI returned empty response");
  }

  return JSON.parse(content);
}

export async function analyzeModule(moduleId: string) {
  const module = await prisma.module.findUnique({
    where: { id: moduleId },
    include: {
      testCases: true,
    },
  });

  if (!module) {
    throw new Error("Module not found");
  }

  if (!module.testCases.length) {
    throw new Error("No test cases in this module");
  }

  const prompt = analyzeModulePrompt(
    module.name,
    module.testCases
  );

  return await runAI(prompt);
}
