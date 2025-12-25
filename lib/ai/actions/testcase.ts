import prisma from "@/lib/prisma";
import openai from "@/lib/ai/client";
import {
  reviewTestCasePrompt,
  generateTestCasesPrompt,
  improveTestCasePrompt,
} from "@/lib/ai/prompts/testcase";
import {
  AIReviewResult,
  AIGenerateResult,
  AIImproveResult,
} from "@/lib/ai/types";

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

/**
 * Review a single test case
 */
export async function reviewTestCase(
  testCaseId: string
): Promise<AIReviewResult> {
  const testCase = await prisma.testCase.findUnique({
    where: { id: testCaseId },
  });

  if (!testCase) {
    throw new Error("Test case not found");
  }

  const prompt = reviewTestCasePrompt(testCase);
  return await runAI(prompt);
}

/**
 * Generate additional test cases for a module
 */
export async function generateTestCases(
  moduleId: string
): Promise<AIGenerateResult> {
  const testCases = await prisma.testCase.findMany({
    where: { moduleId },
  });

  if (!testCases.length) {
    throw new Error("No test cases found for module");
  }

  const prompt = generateTestCasesPrompt(testCases);
  return await runAI(prompt);
}

/**
 * Improve an existing test case
 */
export async function improveTestCase(
  testCaseId: string
): Promise<AIImproveResult> {
  const testCase = await prisma.testCase.findUnique({
    where: { id: testCaseId },
  });

  if (!testCase) {
    throw new Error("Test case not found");
  }

  const prompt = improveTestCasePrompt(testCase);
  return await runAI(prompt);
}
